mod filesystem;
mod metadata;
mod models;
mod playlist_manager;

use models::{Playlist, Song};
use std::path::PathBuf;

// ==================== IMPORT COMMANDS ====================

#[tauri::command]
async fn import_files(file_paths: Vec<String>, app_handle: tauri::AppHandle) -> Result<Vec<Song>, String> {
    let mut imported_songs = Vec::new();

    for file_path_str in file_paths {
        let file_path = PathBuf::from(&file_path_str);

        // Check if it's an MP3 file
        if let Some(ext) = file_path.extension() {
            if !ext.eq_ignore_ascii_case("mp3") {
                continue;
            }
        } else {
            continue;
        }

        // Copy file to all_songs
        let relative_path = filesystem::copy_file_to_all_songs(&file_path, &app_handle)?;

        // Extract metadata
        let absolute_path = filesystem::get_song_absolute_path(&relative_path, &app_handle)?;
        let song = metadata::extract_song_metadata(&absolute_path, relative_path)?;

        // Save to cache
        metadata::update_song_in_cache(song.clone(), &app_handle)?;

        imported_songs.push(song);
    }

    Ok(imported_songs)
}

#[tauri::command]
async fn import_folder(
    folder_path: String,
    playlist_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Playlist, String> {
    let folder = PathBuf::from(&folder_path);

    // Scan for MP3 files
    let mp3_files = filesystem::scan_directory_for_mp3s(&folder)?;

    if mp3_files.is_empty() {
        return Err("No MP3 files found in folder".to_string());
    }

    let mut song_ids = Vec::new();

    // Import each file
    for mp3_file in mp3_files {
        let relative_path = filesystem::copy_file_to_all_songs(&mp3_file, &app_handle)?;
        let absolute_path = filesystem::get_song_absolute_path(&relative_path, &app_handle)?;
        let song = metadata::extract_song_metadata(&absolute_path, relative_path)?;

        metadata::update_song_in_cache(song.clone(), &app_handle)?;
        song_ids.push(song.id);
    }

    // Create playlist
    let playlist = playlist_manager::create_playlist(playlist_name, song_ids, &app_handle)?;

    Ok(playlist)
}

// ==================== SONG QUERY COMMANDS ====================

#[tauri::command]
async fn get_all_songs(app_handle: tauri::AppHandle) -> Result<Vec<Song>, String> {
    let metadata_cache = metadata::load_metadata_cache(&app_handle)?;
    Ok(metadata_cache.songs)
}

#[tauri::command]
async fn get_song_file_path(song_id: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let metadata_cache = metadata::load_metadata_cache(&app_handle)?;

    let song = metadata_cache
        .songs
        .iter()
        .find(|s| s.id == song_id)
        .ok_or_else(|| format!("Song not found: {}", song_id))?;

    let absolute_path = filesystem::get_song_absolute_path(&song.file_path, &app_handle)?;

    absolute_path
        .to_str()
        .ok_or_else(|| "Invalid UTF-8 in path".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
async fn search_songs(query: String, app_handle: tauri::AppHandle) -> Result<Vec<Song>, String> {
    let metadata_cache = metadata::load_metadata_cache(&app_handle)?;
    let results = metadata::search_songs(&query, &metadata_cache.songs);
    Ok(results)
}

// ==================== PLAYLIST QUERY COMMANDS ====================

#[tauri::command]
async fn get_all_playlists(app_handle: tauri::AppHandle) -> Result<Vec<Playlist>, String> {
    playlist_manager::get_all_playlists(&app_handle)
}

#[tauri::command]
async fn get_playlist(id: String, app_handle: tauri::AppHandle) -> Result<Playlist, String> {
    playlist_manager::get_playlist(id, &app_handle)
}

#[tauri::command]
async fn search_playlists(query: String, app_handle: tauri::AppHandle) -> Result<Vec<Playlist>, String> {
    let playlists = playlist_manager::get_all_playlists(&app_handle)?;
    let results = playlist_manager::search_playlists(&query, &playlists);
    Ok(results)
}

// ==================== SONG EDITING COMMANDS ====================

#[tauri::command]
async fn delete_song(song_id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Load metadata to get the song's file path
    let mut metadata_cache = metadata::load_metadata_cache(&app_handle)?;

    let song = metadata_cache
        .songs
        .iter()
        .find(|s| s.id == song_id)
        .ok_or_else(|| format!("Song not found: {}", song_id))?;

    // Get the absolute path of the song file
    let absolute_path = filesystem::get_song_absolute_path(&song.file_path, &app_handle)?;

    // Delete the actual song file
    if absolute_path.exists() {
        std::fs::remove_file(&absolute_path)
            .map_err(|e| format!("Failed to delete song file: {}", e))?;
    }

    // Remove song from all playlists
    let playlists = playlist_manager::get_all_playlists(&app_handle)?;
    for playlist in playlists {
        if playlist.song_ids.contains(&song_id) {
            playlist_manager::remove_songs_from_playlist(
                playlist.id,
                vec![song_id.clone()],
                &app_handle,
            )?;
        }
    }

    // Remove song from metadata cache
    metadata_cache.songs.retain(|s| s.id != song_id);
    metadata::save_metadata_cache(&metadata_cache, &app_handle)?;

    Ok(())
}

// ==================== PLAYLIST EDITING COMMANDS ====================

#[tauri::command]
async fn create_playlist(name: String, app_handle: tauri::AppHandle) -> Result<Playlist, String> {
    playlist_manager::create_playlist(name, Vec::new(), &app_handle)
}

#[tauri::command]
async fn add_songs_to_playlist(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    playlist_manager::add_songs_to_playlist(playlist_id, song_ids, &app_handle)
}

#[tauri::command]
async fn remove_songs_from_playlist(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    playlist_manager::remove_songs_from_playlist(playlist_id, song_ids, &app_handle)
}

#[tauri::command]
async fn rename_playlist(
    playlist_id: String,
    new_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Playlist, String> {
    playlist_manager::rename_playlist(playlist_id, new_name, &app_handle)
}

#[tauri::command]
async fn delete_playlist(id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    playlist_manager::delete_playlist(id, &app_handle)
}

#[tauri::command]
async fn reorder_playlist_songs(
    playlist_id: String,
    song_ids: Vec<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    playlist_manager::reorder_playlist_songs(playlist_id, song_ids, &app_handle)
}

#[tauri::command]
async fn reorder_playlists(
    playlist_ids: Vec<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    playlist_manager::reorder_playlists(playlist_ids, &app_handle)
}

// ==================== APP RUNNER ====================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Initialize app data directory on startup
            filesystem::init_app_data_dir(&app.handle())?;

            // Remove any duplicate playlists
            playlist_manager::deduplicate_playlists(&app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            import_files,
            import_folder,
            get_all_songs,
            get_song_file_path,
            search_songs,
            delete_song,
            get_all_playlists,
            get_playlist,
            search_playlists,
            create_playlist,
            add_songs_to_playlist,
            remove_songs_from_playlist,
            rename_playlist,
            delete_playlist,
            reorder_playlist_songs,
            reorder_playlists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
