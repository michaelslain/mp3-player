import { FC } from 'react'
import ListItem from './ListItem'
import type { Song } from '../types'

interface SongCardProps {
    song: Song
    onClick?: () => void
    onRemove?: () => void
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragOver?: (e: React.DragEvent) => void
    onDragEnter?: (e: React.DragEvent) => void
    onDragEnd?: (e: React.DragEvent) => void
    onDrop?: (e: React.DragEvent) => void
    isDragging?: boolean
    isDropTarget?: boolean
}

const SongCard: FC<SongCardProps> = ({
    song,
    onClick,
    onRemove,
    draggable,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragEnd,
    onDrop,
    isDragging,
    isDropTarget
}) => {
    return (
        <ListItem
            title={song.title}
            subtitle={song.artist}
            onClick={onClick}
            onDelete={onRemove}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            isDragging={isDragging}
            isDropTarget={isDropTarget}
        />
    )
}

export default SongCard
