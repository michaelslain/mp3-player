import { FC, useState, useRef, useEffect } from 'react'
import ListItem from './ListItem'
import type { Playlist } from '../types'

interface PlaylistCardProps {
    playlist: Playlist
    onClick?: () => void
    isEditing?: boolean
    onSaveRename?: (newName: string) => void
    onDelete?: () => void
    onEdit?: () => void
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragOver?: (e: React.DragEvent) => void
    onDragEnd?: (e: React.DragEvent) => void
    onDrop?: (e: React.DragEvent) => void
    isDragging?: boolean
    isDropTarget?: boolean
}

const PlaylistCard: FC<PlaylistCardProps> = ({
    playlist,
    onClick,
    isEditing = false,
    onSaveRename,
    onDelete,
    onEdit,
    draggable = false,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    isDragging = false,
    isDropTarget = false,
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

    const title = isEditing ? (
        <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium w-full bg-transparent outline-none border-b-2 border-blue-500 px-1 text-white"
        />
    ) : (
        playlist.name
    )

    return (
        <ListItem
            title={title}
            subtitle={`${playlist.song_ids.length} songs`}
            onClick={isEditing ? undefined : onClick}
            onDelete={onDelete}
            onEdit={onEdit}
            showEditButton
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            isDragging={isDragging}
            isDropTarget={isDropTarget}
        />
    )
}

export default PlaylistCard
