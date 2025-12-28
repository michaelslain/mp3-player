import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Song, Playlist, ViewType, PathSegment, PlaybackMode, AppState } from '../types';

interface AppContextType extends AppState {
  setView: (view: ViewType) => void;
  setPath: (path: PathSegment) => void;
  setCurrentQueue: (queue: Song[], index: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  refreshSongs: () => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  updatePlaylistName: (playlistId: string, newName: string) => void;
  updatePlaylistSongOrder: (playlistId: string, songIds: string[]) => void;
  reorderPlaylists: (newOrder: Playlist[]) => void;
  nextSong: () => void;
  previousSong: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('grid');
  const [path, setPath] = useState<PathSegment>(['all']);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentQueue, setCurrentQueueState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('shuffle'); // Default to shuffle
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const refreshSongs = async () => {
    try {
      const allSongs = await invoke<Song[]>('get_all_songs');
      setSongs(allSongs);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const refreshPlaylists = async () => {
    try {
      const allPlaylists = await invoke<Playlist[]>('get_all_playlists');
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const setCurrentQueue = (queue: Song[], index: number) => {
    setCurrentQueueState(queue);
    setCurrentIndex(index);
  };

  const nextSong = () => {
    if (currentQueue.length === 0) return;

    if (playbackMode === 'shuffle') {
      // Pick a random song from the queue
      const randomIndex = Math.floor(Math.random() * currentQueue.length);
      setCurrentIndex(randomIndex);
    } else {
      // Sequential: go to next song, or loop back to start
      if (currentIndex < currentQueue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  const previousSong = () => {
    if (currentQueue.length === 0) return;

    if (playbackMode === 'shuffle') {
      // Pick a random song from the queue
      const randomIndex = Math.floor(Math.random() * currentQueue.length);
      setCurrentIndex(randomIndex);
    } else {
      // Sequential: go to previous song, or loop to end
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        setCurrentIndex(currentQueue.length - 1);
      }
    }
  };

  const updatePlaylistName = (playlistId: string, newName: string) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist =>
        playlist.id === playlistId
          ? { ...playlist, name: newName }
          : playlist
      )
    );
  };

  const updatePlaylistSongOrder = (playlistId: string, songIds: string[]) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist =>
        playlist.id === playlistId
          ? { ...playlist, song_ids: songIds }
          : playlist
      )
    );
  };

  const reorderPlaylists = (newOrder: Playlist[]) => {
    setPlaylists(newOrder);
  };

  // Load initial data
  useEffect(() => {
    refreshSongs();
    refreshPlaylists();
  }, []);

  const contextValue: AppContextType = {
    view,
    path,
    songs,
    playlists,
    currentQueue,
    currentIndex,
    playbackMode,
    isPlaying,
    currentTime,
    volume,
    setView,
    setPath,
    setCurrentQueue,
    setPlaybackMode,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    refreshSongs,
    refreshPlaylists,
    updatePlaylistName,
    updatePlaylistSongOrder,
    reorderPlaylists,
    nextSong,
    previousSong,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
