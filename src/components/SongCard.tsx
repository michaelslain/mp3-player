import { FC } from 'react'
import { Disc, X } from 'lucide-react'
import Text from './Text'
import Button from './Button'
import type { Song } from '../types'

interface SongCardProps {
    song: Song
    onClick?: () => void
    onRemove?: () => void
}

const SongCard: FC<SongCardProps> = ({ song, onClick, onRemove }) => {
    return (
        <div
            className="relative flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group"
            onClick={onClick}
        >
            {onRemove && (
                <Button
                    variant="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove()
                    }}
                >
                    <X size={16} />
                </Button>
            )}

            <div className="w-24 h-24 mb-2 flex items-center justify-center bg-gray-300 rounded">
                {song.album_art ? (
                    <img
                        src={song.album_art}
                        alt={song.album}
                        className="w-full h-full object-cover rounded"
                        draggable={false}
                    />
                ) : (
                    <Disc size={48} className="text-gray-500" />
                )}
            </div>

            <Text variant="subtitle" className="text-center truncate w-full">
                {song.title}
            </Text>
            <Text variant="caption" className="text-center truncate w-full">
                {song.artist}
            </Text>
        </div>
    )
}

export default SongCard
