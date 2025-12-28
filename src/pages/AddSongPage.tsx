import { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { CirclePlus } from 'lucide-react'
import GridPageLayout from '../components/GridPageLayout'
import ActionButton from '../components/ActionButton'
import { useAppState } from '../store/appStore'
import { fuzzyMatch } from '../util/search'
import type { Song } from '../types'

const AddSongPage: FC = () => {
    const { path, setPath, songs, playlists, refreshPlaylists } = useAppState()
    const [searchQuery, setSearchQuery] = useState('')

    const playlistName = path[1] as string | undefined
    const currentPlaylist = playlists.find((p) => p.name === playlistName)

    const availableSongs = currentPlaylist
        ? songs.filter((s) => !currentPlaylist.song_ids.includes(s.id))
        : songs

    const filteredSongs = searchQuery
        ? availableSongs.filter(
              (s) =>
                  fuzzyMatch(s.title, searchQuery) ||
                  fuzzyMatch(s.artist, searchQuery) ||
                  (s.album && fuzzyMatch(s.album, searchQuery))
          )
        : availableSongs

    const handlePathNavigate = (index: number) => {
        if (index === 0) {
            setPath(['all'])
        } else if (index === 1 && playlistName) {
            setPath(['playlist', playlistName])
        }
    }

    const handleAddSong = async (song: Song) => {
        if (!currentPlaylist) return

        try {
            await invoke('add_songs_to_playlist', {
                playlistId: currentPlaylist.id,
                songIds: [song.id],
            })
            await refreshPlaylists()
        } catch (error) {
            console.error('Failed to add song to playlist:', error)
            alert('Failed to add song to playlist')
        }
    }

    const pathDisplay = ['All', playlistName || '', 'Add Songs']

    return (
        <GridPageLayout
            pathDisplay={pathDisplay}
            onPathNavigate={handlePathNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search songs..."
        >
            {filteredSongs.map((song) => (
                <div key={song.id} className="w-full flex items-center justify-between py-2 border-b border-gray-700 hover:bg-gray-800">
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-medium truncate text-white">
                            {song.title}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                            {song.artist}
                        </div>
                    </div>
                    <div className="ml-4">
                        <ActionButton
                            onClick={() => handleAddSong(song)}
                            color="#10b981"
                        >
                            <CirclePlus size={14} />
                        </ActionButton>
                    </div>
                </div>
            ))}
        </GridPageLayout>
    )
}

export default AddSongPage
