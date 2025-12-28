import { FC } from 'react'
import { Disc, Shuffle } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import Text from '../components/Text'
import Track from '../components/Track'
import PlayButton from '../components/controls/PlayButton'
import PauseButton from '../components/controls/PauseButton'
import SkipBackButton from '../components/controls/SkipBackButton'
import SkipForwardButton from '../components/controls/SkipForwardButton'
import Button from '../components/Button'
import Path from '../components/Path'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useQueue } from '../hooks/useQueue'
import { useAppState } from '../store/appStore'

const PlayingPage: FC = () => {
    const { setPath, setView } = useAppState()
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

    const pathDisplay = ['All', currentSong.title]

    return (
        <div className="flex-1 flex flex-col min-h-0" ref={containerRef}>
            <Path path={pathDisplay} onNavigate={handlePathNavigate} />

            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 min-h-0">
                {/* Album Art */}
                <div className="w-48 h-48 flex items-center justify-center bg-gray-300 rounded-lg shadow-lg">
                    {currentSong.album_art ? (
                        <img
                            src={currentSong.album_art}
                            alt={currentSong.album}
                            className="w-full h-full object-cover rounded-lg"
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
                <Button
                    variant="ghost"
                    onClick={toggleShuffle}
                    className={
                        playbackMode === 'shuffle'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }
                >
                    <Shuffle size={20} />
                    <span className="ml-2">
                        {playbackMode === 'shuffle'
                            ? 'Shuffle On'
                            : 'Sequential'}
                    </span>
                </Button>
            </div>
        </div>
    )
}

export default PlayingPage
