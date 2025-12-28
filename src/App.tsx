import { AppStateProvider, useAppState } from './store/appStore.tsx'
import { DropZone } from './components/DropZone'
import { GridPage } from './pages/GridPage'
import { PlayingPage } from './pages/PlayingPage'

function AppContent() {
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

function App() {
    return (
        <AppStateProvider>
            <AppContent />
        </AppStateProvider>
    )
}

export default App
