import { FC } from 'react'
import { Folder } from 'lucide-react'
import Card from './Card'
import Text from './Text'
import type { Playlist } from '../types'

interface PlaylistCardProps {
    playlist: Playlist
    onClick?: () => void
    onContextMenu?: (e: React.MouseEvent) => void
}

const PlaylistCard: FC<PlaylistCardProps> = ({
    playlist,
    onClick,
    onContextMenu,
}) => {
    return (
        <Card
            icon={<Folder size={48} className="text-gray-500" />}
            title={
                <Text variant="subtitle" className="text-center truncate w-full">
                    {playlist.name}
                </Text>
            }
            subtitle={
                <Text variant="caption" className="text-center">
                    {playlist.song_ids.length} songs
                </Text>
            }
            onClick={onClick}
            onContextMenu={onContextMenu}
        />
    )
}

export default PlaylistCard
