import { FC } from 'react'
import { Disc } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import Text from '../components/Text'
import Track from '../components/Track'
import PlayButton from '../components/controls/PlayButton'
import PauseButton from '../components/controls/PauseButton'
import SkipBackButton from '../components/controls/SkipBackButton'
import SkipForwardButton from '../components/controls/SkipForwardButton'
import ShuffleButton from '../components/controls/ShuffleButton'
import Path from '../components/Path'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useQueue } from '../hooks/useQueue'
import { useAppState } from '../store/appStore'

const PlayingPage: FC = () => {
    const { path, setPath, setView } = useAppState()
    const { currentSong, isPlaying, currentTime, duration, play, pause, seek } =
        useAudioPlayer()
    const { playbackMode, toggleShuffle, previous, next } = useQueue()
    const containerRef = useRef<HTMLDivElement>(null)

    // Reset scroll position when mounting
    useLayoutEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handlePathNavigate = (index: number) => {
        if (index === 0) {
            setPath(['all'])
            setView('grid')
        } else if (index === 1) {
            // Clicking on the middle segment (All Songs or Playlist Name)
            if (path[0] === 'all_songs') {
                setPath(['all_songs'])
            } else if (path[0] === 'playlist') {
                setPath(['playlist', path[1]])
            }
            setView('grid')
        }
    }

    if (!currentSong) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Text variant="subtitle" className="text-gray-500">
                    No song playing
                </Text>
            </div>
        )
    }

    const pathDisplay = path[0] === 'all'
        ? ['All', currentSong.title]
        : path[0] === 'all_songs'
        ? ['All', 'All Songs', currentSong.title]
        : path[0] === 'playlist'
        ? ['All', path[1], currentSong.title]
        : ['All', currentSong.title]

    return (
        <div className="flex-1 flex flex-col h-full" ref={containerRef}>
            <Path path={pathDisplay} onNavigate={handlePathNavigate} />

            <div className="flex-1 flex flex-col items-center justify-center pt-1">
                {/* Album Art */}
                <div className="w-48 aspect-square flex items-center justify-center rounded-lg overflow-hidden shadow-lg">
                    {currentSong.album_art ? (
                        <img
                            src={currentSong.album_art}
                            alt={currentSong.album}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    ) : (
                        <Disc size={96} className="text-gray-500" />
                    )}
                </div>

                {/* Song Info */}
                <div className="text-center">
                    <Text variant="title" className="mb-2">
                        {currentSong.title}
                    </Text>
                    <Text variant="subtitle" className="text-gray-600">
                        {currentSong.artist}
                    </Text>
                    {currentSong.album && (
                        <Text variant="caption" className="mt-1">
                            {currentSong.album}
                        </Text>
                    )}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                    <SkipBackButton onClick={previous} />
                    {isPlaying ? (
                        <PauseButton onClick={pause} />
                    ) : (
                        <PlayButton onClick={play} />
                    )}
                    <SkipForwardButton onClick={next} />
                </div>

                {/* Track Progress */}
                <div className="w-full max-w-md">
                    <Track
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={seek}
                    />
                </div>

                {/* Shuffle Toggle */}
                <ShuffleButton
                    isShuffling={playbackMode === 'shuffle'}
                    onClick={toggleShuffle}
                />
            </div>
        </div>
    )
}

export default PlayingPage
