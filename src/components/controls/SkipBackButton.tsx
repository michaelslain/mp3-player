import { FC } from 'react'
import { SkipBack } from 'lucide-react'
import Button from '../Button'

interface SkipBackButtonProps {
    onClick: () => void
    disabled?: boolean
}

const SkipBackButton: FC<SkipBackButtonProps> = ({ onClick, disabled }) => {
    return (
        <Button variant="icon" onClick={onClick} disabled={disabled}>
            <SkipBack size={24} />
        </Button>
    )
}

export default SkipBackButton
