import { FC, ReactNode, useState } from 'react'
import { Trash2, Pencil, GripVertical } from 'lucide-react'
import ActionButton from './ActionButton'

interface ListItemProps {
    title: string | ReactNode
    subtitle: string
    onClick?: () => void
    onDelete?: () => void
    onEdit?: () => void
    showEditButton?: boolean
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragOver?: (e: React.DragEvent) => void
    onDragEnter?: (e: React.DragEvent) => void
    onDragEnd?: (e: React.DragEvent) => void
    onDrop?: (e: React.DragEvent) => void
    isDragging?: boolean
    isDropTarget?: boolean
}

const ListItem: FC<ListItemProps> = ({
    title,
    subtitle,
    onClick,
    onDelete,
    onEdit,
    showEditButton = false,
    draggable = false,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragEnd,
    onDrop,
    isDragging = false,
    isDropTarget = false,
}) => {
    const [isGripHeld, setIsGripHeld] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (onDragOver) onDragOver(e)
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        if (onDragEnter) onDragEnter(e)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (onDrop) onDrop(e)
    }

    const handleDragStart = (e: React.DragEvent) => {
        if (!isGripHeld) {
            e.preventDefault()
            return
        }
        if (onDragStart) onDragStart(e)
    }

    const handleDragEnd = (e: React.DragEvent) => {
        setIsGripHeld(false)
        if (onDragEnd) onDragEnd(e)
    }

    return (
        <>
            {isDropTarget && (
                <div className="h-1 bg-blue-500" />
            )}
            <div
                className={`w-full flex items-center justify-between py-2 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-opacity ${
                    isDragging ? 'opacity-50' : ''
                }`}
                onClick={onClick}
                draggable={draggable}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
            >
            <div className="flex-1 min-w-0">
                {typeof title === 'string' ? (
                    <div className="text-base font-medium truncate text-white">
                        {title}
                    </div>
                ) : (
                    title
                )}
                <div className="text-sm text-gray-400 truncate">{subtitle}</div>
            </div>
            {(onDelete || onEdit || draggable) && (
                <div className="flex gap-2 ml-4">
                    {onDelete && (
                        <ActionButton
                            onClick={e => {
                                e.stopPropagation()
                                onDelete()
                            }}
                            color="#ef4444"
                        >
                            <Trash2 size={14} />
                        </ActionButton>
                    )}
                    {showEditButton && onEdit && (
                        <ActionButton
                            onClick={e => {
                                e.stopPropagation()
                                onEdit()
                            }}
                            color="#3b82f6"
                        >
                            <Pencil size={14} />
                        </ActionButton>
                    )}
                    {draggable && (
                        <div
                            className="cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                setIsGripHeld(true)
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation()
                                setIsGripHeld(false)
                            }}
                        >
                            <ActionButton
                                onClick={e => e.stopPropagation()}
                                color="#9ca3af"
                            >
                                <GripVertical size={14} />
                            </ActionButton>
                        </div>
                    )}
                </div>
            )}
            </div>
        </>
    )
}

export default ListItem
