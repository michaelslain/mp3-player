import { FC } from 'react'

interface TrackProps {
    currentTime: number
    duration: number
    onSeek: (time: number) => void
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Track: FC<TrackProps> = ({ currentTime, duration, onSeek }) => {
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value)
        onSeek(newTime)
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-sm text-gray-400 px-1">
                <span className="min-w-[3rem]">{formatTime(currentTime)}</span>
                <span className="min-w-[3rem]">{formatTime(duration)}</span>
            </div>
        </div>
    )
}

export default Track
