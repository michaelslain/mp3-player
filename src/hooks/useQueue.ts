import { useAppState } from '../store/appStore';
import type { Song } from '../types';

export function useQueue() {
  const {
    currentQueue,
    currentIndex,
    playbackMode,
    setCurrentQueue,
    setPlaybackMode,
    nextSong,
    previousSong,
  } = useAppState();

  const playQueue = (songs: Song[], startIndex: number = 0) => {
    if (songs.length === 0) return;
    setCurrentQueue(songs, startIndex);
  };

  const toggleShuffle = () => {
    const newMode = playbackMode === 'shuffle' ? 'sequential' : 'shuffle';
    setPlaybackMode(newMode);
  };

  const next = () => {
    nextSong();
  };

  const previous = () => {
    previousSong();
  };

  return {
    currentQueue,
    currentIndex,
    playbackMode,
    playQueue,
    toggleShuffle,
    next,
    previous,
  };
}
