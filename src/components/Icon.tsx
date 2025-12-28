import { ReactNode } from 'react'

type IconSize = 'sm' | 'md' | 'lg' | 'xl'

interface IconProps {
    children: ReactNode
    size?: IconSize
    className?: string
}

const sizeStyles: Record<IconSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
}

export function Icon({ children, size = 'md', className = '' }: IconProps) {
    const baseStyles = sizeStyles[size]
    return <div className={`${baseStyles} ${className}`}>{children}</div>
}
