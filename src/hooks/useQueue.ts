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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playQueue = (songs: Song[], startIndex: number = 0) => {
    if (songs.length === 0) return;

    let queue = songs;
    let index = startIndex;

    // Apply shuffle if in shuffle mode
    if (playbackMode === 'shuffle') {
      // Shuffle all songs except the one we're starting with
      const startSong = songs[startIndex];
      const otherSongs = songs.filter((_, i) => i !== startIndex);
      const shuffledOthers = shuffleArray(otherSongs);
      queue = [startSong, ...shuffledOthers];
      index = 0; // Start song is now at index 0
    }

    setCurrentQueue(queue, index);
  };

  const toggleShuffle = () => {
    const newMode = playbackMode === 'shuffle' ? 'sequential' : 'shuffle';
    setPlaybackMode(newMode);

    // Re-arrange current queue based on new mode
    if (currentQueue.length > 0 && currentIndex < currentQueue.length) {
      const currentSong = currentQueue[currentIndex];
      const remainingSongs = currentQueue.slice(currentIndex + 1);

      if (newMode === 'shuffle') {
        const shuffled = shuffleArray(remainingSongs);
        setCurrentQueue([currentSong, ...shuffled], 0);
      }
      // For sequential, we keep the current order
    }
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
