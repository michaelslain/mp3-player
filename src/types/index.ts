// TypeScript interfaces matching Rust models

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  file_path: string;
  duration_secs: number;
  album_art: string | null; // base64 encoded data URL or null
}

export interface Playlist {
  id: string;
  name: string;
  song_ids: string[];
  created_at: string;
}

export type ViewType = 'grid' | 'playing';

export type PathSegment =
  | ['all']
  | ['all_songs']
  | ['playlist', string]
  | ['add_song', string]
  | ['song', string];

export type PlaybackMode = 'sequential' | 'shuffle';

export interface AppState {
  view: ViewType;
  path: PathSegment;
  songs: Song[];
  playlists: Playlist[];
  currentQueue: Song[];
  currentIndex: number;
  playbackMode: PlaybackMode;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
}

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}
