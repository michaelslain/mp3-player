import { FC } from 'react'
import { AppStateProvider, useAppState } from './store/appStore.tsx'
import DropZone from './components/DropZone'
import GridPage from './pages/GridPage'
import PlayingPage from './pages/PlayingPage'

const AppContent: FC = () => {
    const { view } = useAppState()

    return (
        <DropZone>
            <div className="h-screen flex flex-col bg-white">
                {view === 'grid' && <GridPage />}
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
