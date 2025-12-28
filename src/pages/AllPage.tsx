import { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { FolderPlus } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import GridPageLayout from '../components/GridPageLayout'
import PlaylistCard from '../components/PlaylistCard'
import ActionButton from '../components/ActionButton'
import { useAppState } from '../store/appStore'
import { fuzzyMatch } from '../util/search'

const AllPage: FC = () => {
    const { setPath, songs, playlists, refreshPlaylists, updatePlaylistName, reorderPlaylists } = useAppState()
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
        const trimmedName = newName.trim()

        // Exit edit mode immediately
        setEditingPlaylistId(null)

        if (playlist && trimmedName && trimmedName !== playlist.name) {
            // Optimistically update the UI immediately
            updatePlaylistName(playlistId, trimmedName)

            // Then update the backend
            try {
                await invoke('rename_playlist', {
                    playlistId,
                    newName: trimmedName,
                })
                // Optionally refresh to ensure sync (backend is source of truth)
                await refreshPlaylists()
            } catch (error) {
                console.error('Failed to rename playlist:', error)
                // Revert optimistic update on error
                updatePlaylistName(playlistId, playlist.name)
                alert('Failed to rename playlist')
            }
        }
    }

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source } = result

        // Dropped outside the list or no movement
        if (!destination || destination.index === source.index) {
            return
        }

        const currentOrder = [...playlists]
        const [movedPlaylist] = currentOrder.splice(source.index, 1)
        currentOrder.splice(destination.index, 0, movedPlaylist)

        // Optimistically update UI
        reorderPlaylists(currentOrder)

        // Persist to backend
        try {
            await invoke('reorder_playlists', {
                playlistIds: currentOrder.map(p => p.id)
            })
        } catch (error) {
            console.error('Failed to reorder playlists:', error)
            // Revert on error
            await refreshPlaylists()
            alert('Failed to reorder playlists')
        }
    }

    const filteredPlaylists = searchQuery
        ? playlists.filter((p) => fuzzyMatch(p.name, searchQuery))
        : playlists

    const playlistsContent = (
        <>
            <div className="w-full flex py-2 border-b border-gray-700">
                <ActionButton onClick={handleCreatePlaylist} color="#10b981">
                    <FolderPlus size={14} />
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
            {!searchQuery ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="playlists-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="w-full"
                            >
                                {filteredPlaylists.map((playlist, index) => (
                                    <Draggable
                                        key={playlist.id}
                                        draggableId={playlist.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <PlaylistCard
                                                    playlist={playlist}
                                                    onClick={() => handlePlaylistClick(playlist.id)}
                                                    isEditing={editingPlaylistId === playlist.id}
                                                    onSaveRename={(newName) => handleSaveRename(playlist.id, newName)}
                                                    onDelete={() => handleDeletePlaylist(playlist.id)}
                                                    onEdit={() => handleEditPlaylist(playlist.id)}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                filteredPlaylists.map((playlist) => (
                    <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        onClick={() => handlePlaylistClick(playlist.id)}
                        isEditing={editingPlaylistId === playlist.id}
                        onSaveRename={(newName) => handleSaveRename(playlist.id, newName)}
                        onDelete={() => handleDeletePlaylist(playlist.id)}
                        onEdit={() => handleEditPlaylist(playlist.id)}
                    />
                ))
            )}
        </>
    )

    return (
        <GridPageLayout
            pathDisplay={['All']}
            onPathNavigate={handlePathNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search playlists..."
        >
            {playlistsContent}
        </GridPageLayout>
    )
}

export default AllPage
