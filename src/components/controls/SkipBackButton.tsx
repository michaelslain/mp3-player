import { SkipBack } from 'lucide-react'
import Button from '../Button'

interface SkipBackButtonProps {
    onClick: () => void
    disabled?: boolean
}

export function SkipBackButton({ onClick, disabled }: SkipBackButtonProps) {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <SkipBack size={24} />
        </Button>
    )
}
