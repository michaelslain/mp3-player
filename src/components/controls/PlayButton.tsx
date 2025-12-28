import { Play } from 'lucide-react';
import Button from '../Button';

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PlayButton({ onClick, disabled }: PlayButtonProps) {
  return (
    <Button variant="icon" onClick={onClick} disabled={disabled}>
      <Play size={32} />
    </Button>
  );
}
