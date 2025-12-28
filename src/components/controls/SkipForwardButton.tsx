import { SkipForward } from 'lucide-react'
import Button from '../Button'

interface SkipForwardButtonProps {
    onClick: () => void
    disabled?: boolean
}

export function SkipForwardButton({
    onClick,
    disabled,
}: SkipForwardButtonProps) {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <SkipForward size={24} />
        </Button>
    )
}
