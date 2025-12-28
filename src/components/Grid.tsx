import { FC, ReactNode } from 'react'

interface GridProps {
    children: ReactNode
    className?: string
}

const Grid: FC<GridProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-col p-4 ${className}`}>
            {children}
        </div>
    )
}

export default Grid
