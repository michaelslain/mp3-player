import { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import GridPageLayout from '../components/GridPageLayout'
import SongCard from '../components/SongCard'
import { useAppState } from '../store/appStore'
import { useQueue } from '../hooks/useQueue'
import { fuzzyMatch } from '../util/search'

const SongsPage: FC = () => {
    const { path, setPath, setView, songs, playlists, refreshPlaylists } =
        useAppState()
    const { playQueue } = useQueue()
    const [searchQuery, setSearchQuery] = useState('')

    const isAllSongs = path[0] === 'all_songs'
    const isPlaylist = path[0] === 'playlist'

    const currentPlaylist = isPlaylist
        ? playlists.find((p) => p.name === path[1])
        : null

    const playlistSongs = currentPlaylist
        ? songs.filter((s) => currentPlaylist.song_ids.includes(s.id))
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

    const pathDisplay = isAllSongs
        ? ['All', 'All Songs']
        : ['All', path[1]]

    return (
        <GridPageLayout
            pathDisplay={pathDisplay}
            onPathNavigate={handlePathNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search songs..."
        >
            {filteredSongs.map((song) => (
                <SongCard
                    key={song.id}
                    song={song}
                    onClick={() => handleSongClick(song.id)}
                    onRemove={
                        isPlaylist
                            ? () => handleRemoveSongFromPlaylist(song.id)
                            : undefined
                    }
                />
            ))}
        </GridPageLayout>
    )
}

export default SongsPage
