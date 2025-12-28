import { FC } from 'react'
import { useAppState } from '../store/appStore'
import AllPage from './AllPage'
import SongsPage from './SongsPage'

const GridPage: FC = () => {
    const { path } = useAppState()

    const showAll = path[0] === 'all'
    const showSongs = path[0] === 'all_songs' || path[0] === 'playlist'

    if (showAll) {
        return <AllPage />
    }

    if (showSongs) {
        return <SongsPage />
    }

    return <AllPage />
}

export default GridPage
