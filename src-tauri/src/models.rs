use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Song {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub file_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_secs: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album_art: Option<String>, // Base64-encoded image data
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub song_ids: Vec<String>,
    pub created_at: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppMetadata {
    pub songs: Vec<Song>,
    pub playlists: Vec<Playlist>,
}

impl AppMetadata {
    pub fn new() -> Self {
        Self {
            songs: Vec::new(),
            playlists: Vec::new(),
        }
    }
}
