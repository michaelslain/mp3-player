import { ReactNode } from 'react'

interface GridProps {
    children: ReactNode
    className?: string
}

export function Grid({ children, className = '' }: GridProps) {
    return (
        <div
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${className}`}
        >
            {children}
        </div>
    )
}
