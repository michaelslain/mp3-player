import { FC, ReactNode } from 'react'

interface CardProps {
    icon: ReactNode
    title: ReactNode
    subtitle?: ReactNode
    onClick?: () => void
    onContextMenu?: (e: React.MouseEvent) => void
    actions?: ReactNode
}

const Card: FC<CardProps> = ({
    icon,
    title,
    subtitle,
    onClick,
    onContextMenu,
    actions,
}) => {
    return (
        <div
            className="relative flex flex-col items-center transition-colors cursor-pointer group w-full"
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            {actions}

            <div className="w-full aspect-square mb-2 flex items-center justify-center bg-gray-300 overflow-hidden rounded-lg">
                {icon}
            </div>

            <div className="text-center w-full px-1">
                {title}
                {subtitle && <div>{subtitle}</div>}
            </div>
        </div>
    )
}

export default Card
