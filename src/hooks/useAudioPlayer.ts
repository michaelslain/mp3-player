import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { useAppState } from '../store/appStore';
import type { Song } from '../types';

// Global audio element
let globalAudioElement: HTMLAudioElement | null = null;

export function getAudioElement() {
  if (!globalAudioElement) {
    globalAudioElement = new Audio();
  }
  return globalAudioElement;
}

export function useAudioPlayer() {
  const audioRef = { current: getAudioElement() };
  const {
    currentQueue,
    currentIndex,
    isPlaying,
    currentTime,
    volume,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    nextSong,
  } = useAppState();

  const currentSong = currentQueue[currentIndex] || null;
  const [duration, setDuration] = useState(0);

  // Load song when current song changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const loadSong = async () => {
      try {
        const filePath = await invoke<string>('get_song_file_path', {
          songId: currentSong.id,
        });

        console.log('Loading song from path:', filePath);

        // Read the file as bytes and create a blob URL
        const fileBytes = await readFile(filePath);
        const blob = new Blob([fileBytes], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);

        console.log('Created blob URL:', blobUrl);

        // Revoke old blob URL if exists
        if (audioRef.current!.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current!.src);
        }

        audioRef.current!.src = blobUrl;

        if (isPlaying) {
          audioRef.current!.play().catch(console.error);
        }
      } catch (error) {
        console.error('Failed to load song:', error);
      }
    };

    loadSong();
  }, [currentSong?.id]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioRef.current) return;

    console.log('isPlaying changed to:', isPlaying, 'audio src:', audioRef.current.src);
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // Auto-advance to next song
      nextSong();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [nextSong, setCurrentTime, setIsPlaying]);

  const play = () => {
    console.log('Play button clicked, current song:', currentSong);
    setIsPlaying(true);
  };

  const pause = () => {
    console.log('Pause button clicked');
    setIsPlaying(false);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return {
    audioRef,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    setVolume: changeVolume,
  };
}
