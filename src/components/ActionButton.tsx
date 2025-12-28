import { FC, MouseEventHandler } from 'react'

interface ActionButtonProps {
    onClick?: MouseEventHandler<HTMLButtonElement>
    color: string
    children: React.ReactNode
}

const ActionButton: FC<ActionButtonProps> = ({
    onClick,
    color,
    children,
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        alert('ActionButton clicked!')
        console.log('ActionButton clicked')
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <button
            onClick={handleClick}
            className="w-6 h-6 flex items-center justify-center text-sm cursor-pointer"
            style={{ color }}
        >
            {children}
        </button>
    )
}

export default ActionButton
