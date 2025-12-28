use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;
use walkdir::WalkDir;

/// Get the app data directory path
pub fn get_app_data_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}

/// Initialize the app data directory structure
pub fn init_app_data_dir(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let app_data_path = get_app_data_path(app_handle)?;

    // Create main directories
    let music_dir = app_data_path.join("music");
    let all_songs_dir = music_dir.join("all_songs");
    let playlists_dir = music_dir.join("playlists");

    fs::create_dir_all(&all_songs_dir)
        .map_err(|e| format!("Failed to create all_songs directory: {}", e))?;

    fs::create_dir_all(&playlists_dir)
        .map_err(|e| format!("Failed to create playlists directory: {}", e))?;

    // Create metadata.json if it doesn't exist
    let metadata_path = app_data_path.join("metadata.json");
    if !metadata_path.exists() {
        let empty_metadata = crate::models::AppMetadata::new();
        let json = serde_json::to_string_pretty(&empty_metadata)
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?;
        fs::write(&metadata_path, json)
            .map_err(|e| format!("Failed to write metadata file: {}", e))?;
    }

    Ok(())
}

/// Copy a file to the all_songs directory
/// Returns the relative path from all_songs/
pub fn copy_file_to_all_songs(
    source: &Path,
    app_handle: &tauri::AppHandle,
) -> Result<String, String> {
    let app_data_path = get_app_data_path(app_handle)?;
    let all_songs_dir = app_data_path.join("music/all_songs");

    // Get the filename
    let filename = source
        .file_name()
        .ok_or_else(|| "Invalid source file path".to_string())?;

    // Handle duplicate filenames
    let mut dest_path = all_songs_dir.join(filename);
    let mut counter = 1;

    while dest_path.exists() {
        let stem = source.file_stem().and_then(|s| s.to_str()).unwrap_or("song");
        let ext = source.extension().and_then(|s| s.to_str()).unwrap_or("mp3");
        let new_filename = format!("{}_{}.{}", stem, counter, ext);
        dest_path = all_songs_dir.join(new_filename);
        counter += 1;
    }

    // Copy the file
    fs::copy(source, &dest_path)
        .map_err(|e| format!("Failed to copy file: {}", e))?;

    // Return relative path
    let relative_path = dest_path
        .strip_prefix(&all_songs_dir)
        .map_err(|e| format!("Failed to get relative path: {}", e))?
        .to_str()
        .ok_or_else(|| "Invalid UTF-8 in path".to_string())?
        .to_string();

    Ok(relative_path)
}

/// Create a symlink in a playlist folder
#[allow(unused_variables)]
pub fn create_playlist_symlink(
    song_path: &Path,
    playlist_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
    let app_data_path = get_app_data_path(app_handle)?;
    let playlist_dir = app_data_path.join("music/playlists").join(playlist_name);

    // Create playlist directory if it doesn't exist
    fs::create_dir_all(&playlist_dir)
        .map_err(|e| format!("Failed to create playlist directory: {}", e))?;

    let song_filename = song_path
        .file_name()
        .ok_or_else(|| "Invalid song path".to_string())?;

    let link_path = playlist_dir.join(song_filename);

    // Skip if symlink already exists
    if link_path.exists() {
        return Ok(());
    }

    // Create symlink (platform-specific)
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(song_path, &link_path)
            .map_err(|e| format!("Failed to create symlink: {}", e))?;
    }

    #[cfg(windows)]
    {
        // On Windows, we'll use hardlinks instead of symlinks (no admin rights needed)
        std::fs::hard_link(song_path, &link_path)
            .map_err(|e| format!("Failed to create hard link: {}", e))?;
    }

    Ok(())
}

/// Scan a directory recursively for MP3 files
pub fn scan_directory_for_mp3s(dir: &Path) -> Result<Vec<PathBuf>, String> {
    let mut mp3_files = Vec::new();

    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext.eq_ignore_ascii_case("mp3") {
                    mp3_files.push(path.to_path_buf());
                }
            }
        }
    }

    Ok(mp3_files)
}

/// Get the absolute path to a song file from its ID
pub fn get_song_absolute_path(
    file_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let app_data_path = get_app_data_path(app_handle)?;
    let all_songs_dir = app_data_path.join("music/all_songs");
    let absolute_path = all_songs_dir.join(file_path);

    if !absolute_path.exists() {
        return Err(format!("Song file not found: {}", file_path));
    }

    Ok(absolute_path)
}
