import { Pause } from 'lucide-react'
import Button from '../Button'

interface PauseButtonProps {
    onClick: () => void
    disabled?: boolean
}

export function PauseButton({ onClick, disabled }: PauseButtonProps) {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <Pause size={32} />
        </Button>
    )
}
