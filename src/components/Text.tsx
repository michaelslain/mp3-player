import { FC, ReactNode } from 'react'

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

const Text: FC<TextProps> = ({
    variant = 'body',
    children,
    className = '',
}) => {
    const baseStyles = variantStyles[variant]
    return <div className={`${baseStyles} ${className}`}>{children}</div>
}

export default Text
