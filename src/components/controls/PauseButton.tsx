import { FC } from 'react'
import { Pause } from 'lucide-react'
import Button from '../Button'

interface PauseButtonProps {
    onClick: () => void
    disabled?: boolean
}

const PauseButton: FC<PauseButtonProps> = ({ onClick, disabled }) => {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <Pause size={32} />
        </Button>
    )
}

export default PauseButton
