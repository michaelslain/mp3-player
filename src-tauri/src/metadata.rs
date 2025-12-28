use crate::models::{AppMetadata, Song};
use base64::{engine::general_purpose, Engine as _};
use id3::{Tag, TagLike};
use std::fs;
use std::path::Path;
use uuid::Uuid;

/// Extract song metadata from an MP3 file
pub fn extract_song_metadata(file_path: &Path, relative_path: String) -> Result<Song, String> {
    // Try to read ID3 tags
    let tag = Tag::read_from_path(file_path).ok();

    // Extract title (fallback to filename)
    let title = tag
        .as_ref()
        .and_then(|t| t.title().map(|s| s.to_string()))
        .unwrap_or_else(|| {
            file_path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Unknown")
                .to_string()
        });

    // Extract artist
    let artist = tag
        .as_ref()
        .and_then(|t| t.artist().map(|s| s.to_string()))
        .unwrap_or_else(|| "Unknown Artist".to_string());

    // Extract album
    let album = tag
        .as_ref()
        .and_then(|t| t.album().map(|s| s.to_string()))
        .unwrap_or_else(|| "Unknown Album".to_string());

    // Extract duration
    let duration_secs = tag.as_ref().and_then(|t| t.duration());

    // Extract album art
    let album_art = tag.as_ref().and_then(|t| extract_album_art(t));

    Ok(Song {
        id: Uuid::new_v4().to_string(),
        title,
        artist,
        album,
        file_path: relative_path,
        duration_secs,
        album_art,
    })
}

/// Extract album art from ID3 tag and encode as base64
fn extract_album_art(tag: &Tag) -> Option<String> {
    // Get the first picture (usually the cover art)
    tag.pictures().next().map(|picture| {
        let mime_type = &picture.mime_type;
        let data = &picture.data;

        // Encode image as base64
        let base64_data = general_purpose::STANDARD.encode(data);

        // Return as data URL
        format!("data:{};base64,{}", mime_type, base64_data)
    })
}

/// Load metadata cache from disk
pub fn load_metadata_cache(app_handle: &tauri::AppHandle) -> Result<AppMetadata, String> {
    let app_data_path = crate::filesystem::get_app_data_path(app_handle)?;
    let metadata_path = app_data_path.join("metadata.json");

    if !metadata_path.exists() {
        return Ok(AppMetadata::new());
    }

    let contents = fs::read_to_string(&metadata_path)
        .map_err(|e| format!("Failed to read metadata file: {}", e))?;

    serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse metadata JSON: {}", e))
}

/// Save metadata cache to disk
pub fn save_metadata_cache(
    metadata: &AppMetadata,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let app_data_path = crate::filesystem::get_app_data_path(app_handle)?;
    let metadata_path = app_data_path.join("metadata.json");

    let json = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

    fs::write(&metadata_path, json)
        .map_err(|e| format!("Failed to write metadata file: {}", e))?;

    Ok(())
}

/// Update a single song in the cache
pub fn update_song_in_cache(
    song: Song,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let mut metadata = load_metadata_cache(app_handle)?;

    // Find and update or add the song
    if let Some(existing) = metadata.songs.iter_mut().find(|s| s.id == song.id) {
        *existing = song;
    } else {
        metadata.songs.push(song);
    }

    save_metadata_cache(&metadata, app_handle)?;

    Ok(())
}

/// Search songs by query (matches title, artist, or album)
pub fn search_songs(query: &str, songs: &[Song]) -> Vec<Song> {
    let query_lower = query.to_lowercase();

    songs
        .iter()
        .filter(|song| {
            song.title.to_lowercase().contains(&query_lower)
                || song.artist.to_lowercase().contains(&query_lower)
                || song.album.to_lowercase().contains(&query_lower)
        })
        .cloned()
        .collect()
}
