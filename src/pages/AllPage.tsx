import { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import GridPageLayout from '../components/GridPageLayout'
import PlaylistCard from '../components/PlaylistCard'
import ActionButton from '../components/ActionButton'
import { useAppState } from '../store/appStore'
import { fuzzyMatch } from '../util/search'

const AllPage: FC = () => {
    const { setPath, songs, playlists, refreshPlaylists } = useAppState()
    const [searchQuery, setSearchQuery] = useState('')
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
        null
    )

    const handlePathNavigate = (index: number) => {
        if (index === 0) {
            setPath(['all'])
        }
    }

    const handlePlaylistClick = (playlistId: string) => {
        const playlist = playlists.find((p) => p.id === playlistId)
        if (playlist) {
            setPath(['playlist', playlist.name])
        }
    }

    const handleAllSongsClick = () => {
        setPath(['all_songs'])
    }

    const handleCreatePlaylist = async () => {
        try {
            await invoke('create_playlist', { name: 'Untitled' })
            await refreshPlaylists()
        } catch (error) {
            console.error('Failed to create playlist:', error)
            alert('Failed to create playlist')
        }
    }

    const handleDeletePlaylist = async (playlistId: string) => {
        const playlist = playlists.find((p) => p.id === playlistId)
        if (playlist && confirm(`Delete playlist "${playlist.name}"?`)) {
            try {
                await invoke('delete_playlist', { id: playlistId })
                await refreshPlaylists()
            } catch (error) {
                console.error('Failed to delete playlist:', error)
                alert('Failed to delete playlist')
            }
        }
    }

    const handleEditPlaylist = (playlistId: string) => {
        setEditingPlaylistId(playlistId)
    }

    const handleSaveRename = async (playlistId: string, newName: string) => {
        const playlist = playlists.find((p) => p.id === playlistId)
        if (playlist && newName.trim() && newName !== playlist.name) {
            try {
                await invoke('rename_playlist', {
                    id: playlistId,
                    newName: newName.trim(),
                })
                await refreshPlaylists()
            } catch (error) {
                console.error('Failed to rename playlist:', error)
                alert('Failed to rename playlist')
            }
        }
        setEditingPlaylistId(null)
    }

    const filteredPlaylists = searchQuery
        ? playlists.filter((p) => fuzzyMatch(p.name, searchQuery))
        : playlists

    return (
        <GridPageLayout
            pathDisplay={['All']}
            onPathNavigate={handlePathNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search playlists..."
        >
            <div className="w-full flex items-center justify-between py-2 px-4 border-b border-gray-200">
                <div className="flex-1 text-base font-medium">Playlists</div>
                <ActionButton onClick={handleCreatePlaylist} backgroundColor="#10b981">
                    +
                </ActionButton>
            </div>
            {!searchQuery && (
                <PlaylistCard
                    playlist={{
                        id: 'all_songs',
                        name: 'All Songs',
                        song_ids: songs.map((s) => s.id),
                        created_at: '',
                    }}
                    onClick={handleAllSongsClick}
                />
            )}
            {filteredPlaylists.map((playlist) => (
                <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    isEditing={editingPlaylistId === playlist.id}
                    onSaveRename={(newName) => handleSaveRename(playlist.id, newName)}
                    onDelete={() => handleDeletePlaylist(playlist.id)}
                    onEdit={() => handleEditPlaylist(playlist.id)}
                />
            ))}
        </GridPageLayout>
    )
}

export default AllPage
