import { FC, MouseEventHandler } from 'react'

interface ActionButtonProps {
    onClick?: MouseEventHandler<HTMLButtonElement>
    backgroundColor: string
    children: React.ReactNode
}

const ActionButton: FC<ActionButtonProps> = ({
    onClick,
    backgroundColor,
    children,
}) => {
    return (
        <button
            onClick={onClick}
            className="w-6 h-6 flex items-center justify-center text-white text-sm"
            style={{ backgroundColor }}
        >
            {children}
        </button>
    )
}

export default ActionButton
