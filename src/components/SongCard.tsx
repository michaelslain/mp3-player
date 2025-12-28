import { FC } from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import ActionButton from './ActionButton'
import type { Song } from '../types'

interface SongCardProps {
    song: Song
    onClick?: () => void
    onRemove?: () => void
}

const SongCard: FC<SongCardProps> = ({ song, onClick, onRemove }) => {
    return (
        <div className="w-full flex items-center justify-between py-2 px-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={onClick}>
            <div className="flex-1 min-w-0">
                <div className="text-base font-medium truncate">{song.title}</div>
                <div className="text-sm text-gray-500 truncate">{song.artist}</div>
            </div>
            <div className="flex gap-2 ml-4">
                {onRemove && (
                    <ActionButton onClick={(e) => { e.stopPropagation(); onRemove(); }} backgroundColor="#ef4444">
                        <Trash2 size={14} />
                    </ActionButton>
                )}
                <ActionButton onClick={(e) => e.stopPropagation()} backgroundColor="#6b7280">
                    <GripVertical size={14} />
                </ActionButton>
            </div>
        </div>
    )
}

export default SongCard
