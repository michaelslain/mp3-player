import { ReactNode } from 'react'

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption'

interface TextProps {
    variant?: TextVariant
    children: ReactNode
    className?: string
}

const variantStyles: Record<TextVariant, string> = {
    title: 'text-2xl font-bold',
    subtitle: 'text-lg font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-500',
}

export function Text({
    variant = 'body',
    children,
    className = '',
}: TextProps) {
    const baseStyles = variantStyles[variant]
    return <div className={`${baseStyles} ${className}`}>{children}</div>
}
