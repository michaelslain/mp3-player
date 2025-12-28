import { FC, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'icon'

interface ButtonProps {
    variant?: ButtonVariant
    children: ReactNode
    onClick?: (e?: React.MouseEvent) => void
    className?: string
    disabled?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800',
    ghost: 'px-4 py-2 bg-transparent hover:bg-gray-200 active:bg-gray-300 rounded',
    icon: 'p-2 bg-transparent hover:bg-gray-200 active:bg-gray-300 rounded-full',
}

const Button: FC<ButtonProps> = ({
    variant = 'primary',
    children,
    onClick,
    className = '',
    disabled = false,
}) => {
    const baseStyles = variantStyles[variant]
    const disabledStyles = disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer'

    return (
        <button
            onClick={(e) => onClick?.(e)}
            disabled={disabled}
            className={`${baseStyles} ${disabledStyles} ${className} transition-colors`}
        >
            {children}
        </button>
    )
}

export default Button
