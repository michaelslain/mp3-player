import { FC, useState, useRef, useEffect } from 'react'
import { Trash2, Pencil, GripVertical } from 'lucide-react'
import ActionButton from './ActionButton'
import type { Playlist } from '../types'

interface PlaylistCardProps {
    playlist: Playlist
    onClick?: () => void
    isEditing?: boolean
    onSaveRename?: (newName: string) => void
    onDelete?: () => void
    onEdit?: () => void
}

const PlaylistCard: FC<PlaylistCardProps> = ({
    playlist,
    onClick,
    isEditing = false,
    onSaveRename,
    onDelete,
    onEdit,
}) => {
    const [editValue, setEditValue] = useState(playlist.name)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    useEffect(() => {
        setEditValue(playlist.name)
    }, [playlist.name])

    const handleSave = () => {
        if (onSaveRename) {
            onSaveRename(editValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setEditValue(playlist.name)
            if (onSaveRename) {
                onSaveRename(playlist.name)
            }
        }
    }

    return (
        <div className="w-full flex items-center justify-between py-2 px-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={isEditing ? undefined : onClick}>
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        onClick={(e) => e.stopPropagation()}
                        className="text-base font-medium w-full bg-transparent outline-none border-b-2 border-blue-500 px-1"
                    />
                ) : (
                    <div>
                        <div className="text-base font-medium truncate">{playlist.name}</div>
                        <div className="text-sm text-gray-500">{playlist.song_ids.length} songs</div>
                    </div>
                )}
            </div>
            <div className="flex gap-2 ml-4">
                {onDelete && (
                    <ActionButton onClick={(e) => { e.stopPropagation(); onDelete(); }} backgroundColor="#ef4444">
                        <Trash2 size={14} />
                    </ActionButton>
                )}
                {onEdit && (
                    <ActionButton onClick={(e) => { e.stopPropagation(); onEdit(); }} backgroundColor="#3b82f6">
                        <Pencil size={14} />
                    </ActionButton>
                )}
                <ActionButton onClick={(e) => e.stopPropagation()} backgroundColor="#6b7280">
                    <GripVertical size={14} />
                </ActionButton>
            </div>
        </div>
    )
}

export default PlaylistCard
