import { FC } from 'react'
import { Folder } from 'lucide-react'
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
        <div
            className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <div className="w-24 h-24 mb-2 flex items-center justify-center bg-gray-300 rounded">
                <Folder size={48} className="text-gray-500" />
            </div>

            <Text variant="subtitle" className="text-center truncate w-full">
                {playlist.name}
            </Text>
            <Text variant="caption" className="text-center">
                {playlist.song_ids.length} songs
            </Text>
        </div>
    )
}

export default PlaylistCard
