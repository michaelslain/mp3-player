import { FC } from 'react'
import { Play } from 'lucide-react'
import Button from '../Button'

interface PlayButtonProps {
  onClick: () => void
  disabled?: boolean
}

const PlayButton: FC<PlayButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button variant="icon" onClick={onClick} disabled={disabled}>
      <Play size={32} />
    </Button>
  )
}

export default PlayButton
