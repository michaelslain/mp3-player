import { FC } from 'react'
import { SkipForward } from 'lucide-react'
import Button from '../Button'

interface SkipForwardButtonProps {
    onClick: () => void
    disabled?: boolean
}

const SkipForwardButton: FC<SkipForwardButtonProps> = ({
    onClick,
    disabled,
}) => {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <SkipForward size={24} />
        </Button>
    )
}

export default SkipForwardButton
