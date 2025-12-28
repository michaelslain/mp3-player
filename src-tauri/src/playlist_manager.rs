use crate::filesystem;
use crate::metadata;
use crate::models::Playlist;
use std::fs;
use std::time::SystemTime;

/// Create a new playlist with the given songs
pub fn create_playlist(
    name: String,
    song_ids: Vec<String>,
    app_handle: &tauri::AppHandle,
) -> Result<Playlist, String> {
    use uuid::Uuid;

    let app_data_path = filesystem::get_app_data_path(app_handle)?;
    let playlists_dir = app_data_path.join("music/playlists");
    let all_songs_dir = app_data_path.join("music/all_songs");

    // Generate unique ID for playlist
    let playlist_id = Uuid::new_v4().to_string();
    let playlist_dir = playlists_dir.join(&playlist_id);

    // Create playlist directory
    fs::create_dir_all(&playlist_dir)
        .map_err(|e| format!("Failed to create playlist directory: {}", e))?;

    // Load metadata to get song file paths
    let metadata_cache = metadata::load_metadata_cache(app_handle)?;

    // Create symlinks for each song
    for song_id in &song_ids {
        if let Some(song) = metadata_cache.songs.iter().find(|s| s.id == *song_id) {
            let song_path = all_songs_dir.join(&song.file_path);
            filesystem::create_playlist_symlink(&song_path, &playlist_id, app_handle)?;
        }
    }

    // Create playlist metadata
    let playlist = Playlist {
        id: playlist_id,
        name,
        song_ids,
        created_at: SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    // Save to metadata cache
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;
    metadata_cache.playlists.push(playlist.clone());
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(playlist)
}

/// Get all playlists
pub fn get_all_playlists(app_handle: &tauri::AppHandle) -> Result<Vec<Playlist>, String> {
    let metadata_cache = metadata::load_metadata_cache(app_handle)?;
    Ok(metadata_cache.playlists)
}

/// Get a specific playlist by ID
pub fn get_playlist(id: String, app_handle: &tauri::AppHandle) -> Result<Playlist, String> {
    let metadata_cache = metadata::load_metadata_cache(app_handle)?;

    metadata_cache
        .playlists
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| format!("Playlist not found: {}", id))
}

/// Add songs to an existing playlist
pub fn add_songs_to_playlist(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let app_data_path = filesystem::get_app_data_path(app_handle)?;
    let all_songs_dir = app_data_path.join("music/all_songs");

    // Load metadata
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;

    // Find the playlist
    let playlist = metadata_cache
        .playlists
        .iter_mut()
        .find(|p| p.id == playlist_id)
        .ok_or_else(|| format!("Playlist not found: {}", playlist_id))?;

    // Add songs to playlist
    for song_id in &song_ids {
        if !playlist.song_ids.contains(song_id) {
            playlist.song_ids.push(song_id.clone());

            // Create symlink
            if let Some(song) = metadata_cache.songs.iter().find(|s| s.id == *song_id) {
                let song_path = all_songs_dir.join(&song.file_path);
                filesystem::create_playlist_symlink(&song_path, &playlist_id, app_handle)?;
            }
        }
    }

    // Save metadata
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(())
}

/// Remove songs from a playlist
pub fn remove_songs_from_playlist(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let app_data_path = filesystem::get_app_data_path(app_handle)?;
    let playlist_dir = app_data_path
        .join("music/playlists")
        .join(&playlist_id);

    // Load metadata
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;

    // Find the playlist
    let playlist = metadata_cache
        .playlists
        .iter_mut()
        .find(|p| p.id == playlist_id)
        .ok_or_else(|| format!("Playlist not found: {}", playlist_id))?;

    // Remove songs from playlist
    for song_id in &song_ids {
        playlist.song_ids.retain(|id| id != song_id);

        // Remove symlink
        if let Some(song) = metadata_cache.songs.iter().find(|s| s.id == *song_id) {
            let song_filename = std::path::Path::new(&song.file_path)
                .file_name()
                .ok_or_else(|| "Invalid song path".to_string())?;
            let link_path = playlist_dir.join(song_filename);

            if link_path.exists() {
                fs::remove_file(&link_path)
                    .map_err(|e| format!("Failed to remove symlink: {}", e))?;
            }
        }
    }

    // Save metadata
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(())
}

/// Rename a playlist
pub fn rename_playlist(
    playlist_id: String,
    new_name: String,
    app_handle: &tauri::AppHandle,
) -> Result<Playlist, String> {
    // Update metadata - just change the name, keep the ID the same
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;
    let playlist = metadata_cache
        .playlists
        .iter_mut()
        .find(|p| p.id == playlist_id)
        .ok_or_else(|| format!("Playlist not found: {}", playlist_id))?;

    playlist.name = new_name;

    let updated_playlist = playlist.clone();

    // Save metadata
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(updated_playlist)
}

/// Delete a playlist
pub fn delete_playlist(id: String, app_handle: &tauri::AppHandle) -> Result<(), String> {
    let app_data_path = filesystem::get_app_data_path(app_handle)?;
    let playlist_dir = app_data_path.join("music/playlists").join(&id);

    // Delete directory
    if playlist_dir.exists() {
        fs::remove_dir_all(&playlist_dir)
            .map_err(|e| format!("Failed to delete playlist directory: {}", e))?;
    }

    // Remove from metadata
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;
    metadata_cache.playlists.retain(|p| p.id != id);

    // Save metadata
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(())
}

/// Search playlists by name
pub fn search_playlists(query: &str, playlists: &[Playlist]) -> Vec<Playlist> {
    let query_lower = query.to_lowercase();

    playlists
        .iter()
        .filter(|playlist| playlist.name.to_lowercase().contains(&query_lower))
        .cloned()
        .collect()
}

/// Reorder songs in a playlist
pub fn reorder_playlist_songs(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    // Update metadata with new song order
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;

    let playlist = metadata_cache
        .playlists
        .iter_mut()
        .find(|p| p.id == playlist_id)
        .ok_or_else(|| format!("Playlist not found: {}", playlist_id))?;

    playlist.song_ids = song_ids;

    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(())
}

/// Reorder playlists to match a new order
pub fn reorder_playlists(
    playlist_ids: Vec<String>,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;

    // Create a new ordered playlist array
    let mut new_playlists = Vec::new();

    for id in playlist_ids {
        if let Some(playlist) = metadata_cache.playlists.iter().find(|p| p.id == id) {
            new_playlists.push(playlist.clone());
        }
    }

    // Update the metadata cache with the new order
    metadata_cache.playlists = new_playlists;
    metadata::save_metadata_cache(&metadata_cache, app_handle)?;

    Ok(())
}

/// Remove duplicate playlists (keeping the first occurrence of each unique ID)
pub fn deduplicate_playlists(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let mut metadata_cache = metadata::load_metadata_cache(app_handle)?;
    let original_count = metadata_cache.playlists.len();

    // Track seen IDs and keep only first occurrence
    let mut seen_ids = std::collections::HashSet::new();
    let mut unique_playlists = Vec::new();

    for playlist in metadata_cache.playlists {
        if seen_ids.insert(playlist.id.clone()) {
            unique_playlists.push(playlist);
        } else {
            // Delete the duplicate playlist directory if it exists
            let app_data_path = filesystem::get_app_data_path(app_handle)?;
            let playlist_dir = app_data_path.join("music/playlists").join(&playlist.id);

            if playlist_dir.exists() {
                let _ = fs::remove_dir_all(&playlist_dir);
            }
        }
    }

    let duplicates_removed = original_count - unique_playlists.len();

    if duplicates_removed > 0 {
        metadata_cache.playlists = unique_playlists;
        metadata::save_metadata_cache(&metadata_cache, app_handle)?;
    }

    Ok(())
}

/// Sanitize a playlist name for use as a directory name
fn sanitize_name(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect()
}
