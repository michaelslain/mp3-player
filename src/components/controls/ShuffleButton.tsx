import { FC } from 'react'
import { Shuffle } from 'lucide-react'
import Button from '../Button'

interface ShuffleButtonProps {
    isShuffling: boolean
    onClick: () => void
}

const ShuffleButton: FC<ShuffleButtonProps> = ({ isShuffling, onClick }) => {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={isShuffling ? 'text-blue-600' : 'text-gray-600'}
        >
            <div className="flex items-center gap-2">
                <Shuffle size={20} />
                <span>{isShuffling ? 'Shuffle On' : 'Sequential'}</span>
            </div>
        </Button>
    )
}

export default ShuffleButton
