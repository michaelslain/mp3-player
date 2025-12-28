import { useEffect, useRef } from 'react'
import type { MenuItem } from '../types'

interface ContextMenuProps {
    items: MenuItem[]
    position: { x: number; y: number }
    onClose: () => void
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                onClose()
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    return (
        <div
            ref={menuRef}
            className="fixed bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-50"
            style={{ top: position.y, left: position.x }}
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => {
                        item.onClick()
                        onClose()
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    )
}
