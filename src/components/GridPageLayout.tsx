import { FC, ReactNode } from 'react'
import Path from './Path'
import SearchBar from './SearchBar'
import Grid from './Grid'

interface GridPageLayoutProps {
    pathDisplay: string[]
    onPathNavigate: (index: number) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    searchPlaceholder: string
    children: ReactNode
}

const GridPageLayout: FC<GridPageLayoutProps> = ({
    pathDisplay,
    onPathNavigate,
    searchQuery,
    onSearchChange,
    searchPlaceholder,
    children,
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <Path path={pathDisplay} onNavigate={onPathNavigate} />
            <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
            />
            <div className="flex-1 overflow-y-auto">
                <Grid>{children}</Grid>
            </div>
        </div>
    )
}

export default GridPageLayout
