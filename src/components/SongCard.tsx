import { FC } from 'react'
import { Disc, X } from 'lucide-react'
import Card from './Card'
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
        <Card
            icon={
                song.album_art ? (
                    <img
                        src={song.album_art}
                        alt={song.album}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <Disc size={48} className="text-gray-500" />
                )
            }
            title={
                <Text
                    variant="subtitle"
                    className="text-center truncate w-full"
                >
                    {song.title}
                </Text>
            }
            subtitle={
                <Text variant="caption" className="text-center truncate w-full">
                    {song.artist}
                </Text>
            }
            onClick={onClick}
            actions={
                onRemove && (
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
                )
            }
        />
    )
}

export default SongCard
