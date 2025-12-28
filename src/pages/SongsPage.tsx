import { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { SquarePlus } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import GridPageLayout from '../components/GridPageLayout'
import SongCard from '../components/SongCard'
import ActionButton from '../components/ActionButton'
import { useAppState } from '../store/appStore'
import { useQueue } from '../hooks/useQueue'
import { fuzzyMatch } from '../util/search'

const SongsPage: FC = () => {
    const { path, setPath, setView, songs, playlists, refreshPlaylists, refreshSongs, updatePlaylistSongOrder } =
        useAppState()
    const { playQueue } = useQueue()
    const [searchQuery, setSearchQuery] = useState('')

    const isAllSongs = path[0] === 'all_songs'
    const isPlaylist = path[0] === 'playlist'

    const currentPlaylist = isPlaylist
        ? playlists.find((p) => p.name === path[1])
        : null

    const playlistSongs = currentPlaylist
        ? currentPlaylist.song_ids
              .map((id) => songs.find((s) => s.id === id))
              .filter((s): s is NonNullable<typeof s> => s !== undefined)
        : []

    const displaySongs = isAllSongs ? songs : playlistSongs

    const filteredSongs = searchQuery
        ? displaySongs.filter(
              (s) =>
                  fuzzyMatch(s.title, searchQuery) ||
                  fuzzyMatch(s.artist, searchQuery) ||
                  (s.album && fuzzyMatch(s.album, searchQuery))
          )
        : displaySongs

    const handlePathNavigate = (index: number) => {
        if (index === 0) {
            setPath(['all'])
        } else if (index === 1 && isPlaylist) {
            setPath(['playlist', path[1]])
        } else if (index === 1 && isAllSongs) {
            setPath(['all_songs'])
        }
    }

    const handleSongClick = (songId: string) => {
        const songIndex = displaySongs.findIndex((s) => s.id === songId)
        if (songIndex !== -1) {
            playQueue(displaySongs, songIndex)
            setView('playing')
        }
    }

    const handleRemoveSongFromPlaylist = async (songId: string) => {
        if (!isPlaylist || !currentPlaylist) return

        try {
            await invoke('remove_songs_from_playlist', {
                playlistId: currentPlaylist.id,
                songIds: [songId],
            })
            await refreshPlaylists()
        } catch (error) {
            console.error('Failed to remove song from playlist:', error)
            alert('Failed to remove song from playlist')
        }
    }

    const handleDeleteSong = async (songId: string) => {
        console.log('Delete clicked for song:', songId)
        try {
            await invoke('delete_song', { songId })
            console.log('Delete successful')
            await refreshSongs()
            await refreshPlaylists()
        } catch (error) {
            console.error('Failed to delete song:', error)
            alert(`Failed to delete song: ${error}`)
        }
    }

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source } = result

        // Dropped outside the list or no movement
        if (!destination || destination.index === source.index) {
            return
        }

        if (!isPlaylist || !currentPlaylist) return

        // Get the current order
        const currentOrder = [...currentPlaylist.song_ids]
        const [movedSongId] = currentOrder.splice(source.index, 1)
        currentOrder.splice(destination.index, 0, movedSongId)

        // Optimistically update the UI
        updatePlaylistSongOrder(currentPlaylist.id, currentOrder)

        // Update backend
        try {
            await invoke('reorder_playlist_songs', {
                playlistId: currentPlaylist.id,
                songIds: currentOrder,
            })
        } catch (error) {
            console.error('Failed to reorder songs:', error)
            // Revert on error
            await refreshPlaylists()
            alert('Failed to reorder songs')
        }
    }

    const handleAddSongClick = () => {
        if (isPlaylist && path[1]) {
            setPath(['add_song', path[1]])
        }
    }

    const pathDisplay = isAllSongs
        ? ['All', 'All Songs']
        : ['All', path[1] || '']

    const songsContent = (
        <>
            {isPlaylist && (
                <div className="w-full flex py-2 border-b border-gray-700">
                    <ActionButton onClick={handleAddSongClick} color="#10b981">
                        <SquarePlus size={14} />
                    </ActionButton>
                </div>
            )}
            {isPlaylist ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="songs-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="w-full"
                            >
                                {filteredSongs.map((song, index) => (
                                    <Draggable
                                        key={song.id}
                                        draggableId={song.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <SongCard
                                                    song={song}
                                                    onClick={() => handleSongClick(song.id)}
                                                    onRemove={() => handleRemoveSongFromPlaylist(song.id)}
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
                filteredSongs.map((song) => (
                    <SongCard
                        key={song.id}
                        song={song}
                        onClick={() => handleSongClick(song.id)}
                        onRemove={() => handleDeleteSong(song.id)}
                    />
                ))
            )}
        </>
    )

    return (
        <GridPageLayout
            pathDisplay={pathDisplay}
            onPathNavigate={handlePathNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search songs..."
        >
            {songsContent}
        </GridPageLayout>
    )
}

export default SongsPage
