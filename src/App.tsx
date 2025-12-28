import { FC } from 'react'
import { AppStateProvider, useAppState } from './store/appStore.tsx'
import DropZone from './components/DropZone'
import AllPage from './pages/AllPage'
import SongsPage from './pages/SongsPage'
import AddSongPage from './pages/AddSongPage'
import PlayingPage from './pages/PlayingPage'

const AppContent: FC = () => {
    const { view, path } = useAppState()

    const showAll = path[0] === 'all'
    const showSongs = path[0] === 'all_songs' || path[0] === 'playlist'
    const showAddSong = path[0] === 'add_song'

    return (
        <DropZone>
            <div className="h-screen flex flex-col bg-gray-900 text-white">
                {view === 'grid' && showAll && <AllPage />}
                {view === 'grid' && showSongs && <SongsPage />}
                {view === 'grid' && showAddSong && <AddSongPage />}
                {view === 'playing' && <PlayingPage />}
            </div>
        </DropZone>
    )
}

const App: FC = () => {
    return (
        <AppStateProvider>
            <AppContent />
        </AppStateProvider>
    )
}

export default App
