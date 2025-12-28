import { useState, useEffect, ReactNode } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'
import { Upload } from 'lucide-react'
import { useAppState } from '../store/appStore'

interface DropZoneProps {
    children: ReactNode
}

export function DropZone({ children }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const { refreshSongs, refreshPlaylists } = useAppState()

    useEffect(() => {
        let unlistenDrop: (() => void) | undefined
        let mounted = true

        const setupListeners = async () => {
            console.log('Setting up file drop listeners...')
            const window = getCurrentWindow()

            unlistenDrop = await window.onDragDropEvent(async event => {
                if (!mounted) return // Ignore events if component unmounted
                console.log('Drag drop event received:', event)

                if (event.payload.type === 'drop') {
                    const paths = event.payload.paths
                    console.log('Files dropped:', paths)
                    if (paths.length === 0 || isProcessing) return

                    setIsDragging(false)
                    setIsProcessing(true)

                    try {
                        // Check if it's a single directory
                        const firstPath = paths[0]
                        const isDirectory =
                            firstPath.endsWith('/') || !firstPath.includes('.')

                        if (paths.length === 1 && isDirectory) {
                            // Folder dropped - create playlist with folder name
                            const folderName =
                                firstPath.split('/').filter(Boolean).pop() ||
                                'New Playlist'
                            console.log(
                                'Importing folder:',
                                firstPath,
                                'as playlist:',
                                folderName
                            )
                            await invoke('import_folder', {
                                folderPath: firstPath,
                                playlistName: folderName,
                            })
                            await refreshPlaylists()
                            alert(`Created playlist "${folderName}"`)
                        } else {
                            // Individual files dropped - add to "All Songs"
                            console.log('Importing files:', paths)
                            await invoke('import_files', { filePaths: paths })
                            await refreshSongs()
                            alert(`Added ${paths.length} song(s) to All Songs`)
                        }
                    } catch (error) {
                        console.error('Failed to import files:', error)
                        alert(`Failed to import files: ${error}`)
                    } finally {
                        setIsProcessing(false)
                    }
                } else if (
                    event.payload.type === 'enter' ||
                    event.payload.type === 'over'
                ) {
                    console.log('File drag hover detected')
                    setIsDragging(true)
                } else if (event.payload.type === 'leave') {
                    console.log('File drag cancelled')
                    setIsDragging(false)
                }
            })

            console.log('File drop listeners set up successfully')
        }

        setupListeners()

        return () => {
            mounted = false
            if (unlistenDrop) unlistenDrop()
        }
    }, [refreshSongs, refreshPlaylists])

    return (
        <div className="relative w-full h-full">
            {children}

            {isDragging && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-blue-500 border-dashed flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                        <Upload
                            size={64}
                            className="mx-auto mb-4 text-blue-600"
                        />
                        <div className="text-xl font-bold mb-2">
                            Drop files here
                        </div>
                        <div className="text-gray-600">
                            Drop MP3 files to add to All Songs
                            <br />
                            Drop a folder to create a new playlist
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
