# MP3 Player - Tauri + React App

A local music player built with Tauri (Rust backend) and React (TypeScript frontend).

## Tech Stack

-   **Backend**: Rust (Tauri v2)
-   **Frontend**: React 19 + TypeScript + Vite
-   **Styling**: Tailwind CSS v4
-   **Icons**: lucide-react
-   **State**: React Context API
-   **Audio**: HTML5 `<audio>` element

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # Base button with variants (primary, ghost, icon)
│   ├── ContextMenu.tsx  # Right-click menu for playlists
│   ├── DropZone.tsx     # Drag & drop file import handler
│   ├── Grid.tsx         # Responsive grid layout
│   ├── Icon.tsx         # Icon wrapper
│   ├── Path.tsx         # Breadcrumb navigation
│   ├── PlaylistCard.tsx # Playlist display card
│   ├── SongCard.tsx     # Song display card with album art
│   ├── Text.tsx         # Text with variants (title, subtitle, body, caption)
│   ├── Track.tsx        # Progress bar + seek + time display
│   └── controls/        # Playback control buttons
│       ├── PlayButton.tsx
│       ├── PauseButton.tsx
│       ├── SkipBackButton.tsx
│       └── SkipForwardButton.tsx
├── hooks/
│   ├── useAudioPlayer.ts # Audio playback management (play, pause, seek, volume)
│   └── useQueue.ts       # Queue management (shuffle, sequential, next/prev)
├── pages/
│   ├── GridPage.tsx      # Shows playlists or songs in grid view
│   └── PlayingPage.tsx   # Now playing screen with controls
├── store/
│   └── appStore.tsx      # Global state (view, path, songs, playlists, queue, playback mode)
├── types/
│   └── index.ts          # TypeScript interfaces (Song, Playlist, etc.)
└── App.tsx               # Main app with routing

src-tauri/
├── src/
│   ├── filesystem.rs     # File operations (copy, scan, paths)
│   ├── metadata.rs       # ID3 tag extraction, album art encoding, caching
│   ├── models.rs         # Rust structs (Song, Playlist, AppMetadata)
│   ├── playlist_manager.rs # Playlist CRUD operations
│   └── lib.rs            # Tauri commands + app entry point
├── Cargo.toml            # Rust dependencies
└── tauri.conf.json       # Tauri configuration
```

## Backend (Rust)

### File Organization

-   **All Songs**: `$APPDATA/music/all_songs/` - All imported MP3 files stored here
-   **Playlists**: `$APPDATA/music/playlists/{playlist_name}/` - Contains symlinks to songs in all_songs
-   **Metadata Cache**: `$APPDATA/metadata.json` - Cached ID3 data (title, artist, album, duration, base64 album art)

### Tauri Commands

**Import**:

-   `import_files(file_paths: Vec<String>)` → `Vec<Song>`
-   `import_folder(folder_path: String, playlist_name: String)` → `Playlist`

**Song Queries**:

-   `get_all_songs()` → `Vec<Song>`
-   `get_song_file_path(song_id: String)` → `String` (absolute path)
-   `search_songs(query: String)` → `Vec<Song>`

**Playlist Queries**:

-   `get_all_playlists()` → `Vec<Playlist>`
-   `get_playlist(id: String)` → `Playlist`
-   `search_playlists(query: String)` → `Vec<Playlist>`

**Playlist Editing**:

-   `add_songs_to_playlist(playlist_id: String, song_ids: Vec<String>)`
-   `remove_songs_from_playlist(playlist_id: String, song_ids: Vec<String>)`
-   `rename_playlist(playlist_id: String, new_name: String)` → `Playlist`
-   `delete_playlist(id: String)`

## Frontend

### State Management (`appStore.tsx`)

Global state includes:

-   `view`: `'grid' | 'playing'`
-   `path`: Navigation breadcrumb (e.g., `['all']`, `['playlist', 'id']`)
-   `songs`: All imported songs
-   `playlists`: All playlists
-   `currentQueue`: Currently playing queue
-   `currentIndex`: Index in queue
-   `playbackMode`: `'sequential' | 'shuffle'` (defaults to shuffle)
-   `isPlaying`, `currentTime`, `volume`: Playback state

### Audio Playback

-   Uses global `HTMLAudioElement` singleton via `getAudioElement()`
-   Loads songs by reading file bytes via Tauri FS plugin and creating blob URLs
-   Supports play, pause, seek, volume control
-   Auto-advances to next song when current ends

### Drag & Drop

-   Listens for Tauri v2 `onDragDropEvent()` API
-   **Files**: Imports to "All Songs" via `import_files()`
-   **Folders**: Creates playlist with folder name via `import_folder()`
-   Prevents duplicate imports with `isProcessing` flag

### Navigation

-   **Grid View**: Shows all playlists + "All Songs" card, or songs within a playlist
-   **Playing View**: Shows current song info, controls, progress bar, shuffle toggle
-   Path breadcrumb allows clicking to navigate back

### Playlist Management

-   Right-click on playlist card shows context menu (Rename, Delete)
-   Inside playlist view: can add songs from All Songs or remove songs

## Configuration

### `tauri.conf.json`

```json
{
    "app": {
        "windows": [
            {
                "dragDropEnabled": true // Enable file drag & drop
            }
        ],
        "security": {
            "assetProtocol": {
                "enable": true,
                "scope": ["**"]
            }
        }
    }
}
```

### `src-tauri/capabilities/default.json`

```json
{
    "permissions": [
        "core:default",
        "opener:default",
        "core:path:default",
        "core:event:default",
        "fs:default",
        {
            "identifier": "fs:scope",
            "allow": ["$APPDATA/**/*"] // Required for reading MP3 files
        }
    ]
}
```

### `postcss.config.js`

```js
export default {
    plugins: {
        '@tailwindcss/postcss': {}, // Tailwind v4 requires separate plugin
        autoprefixer: {},
    },
}
```

## Known Issues & Fixes

### Images Draggable

-   **Fix**: Add `draggable={false}` to all `<img>` tags

### Playing Page Blank Until Scroll

-   **Cause**: Scroll position preserved when switching from GridPage to PlayingPage
-   **Fix**: `window.scrollTo(0, 0)` in `useLayoutEffect` on PlayingPage mount

### Time Display Issues

-   Duration requires listening for `loadedmetadata` event, stored in state
-   Format: `formatTime(seconds)` → `"4:08"`

### Duplicate Songs on Import

-   **Fix**: `isProcessing` state + `mounted` flag in DropZone to prevent concurrent imports

### Tauri v2 File Drop API

-   Old API: `listen('tauri://file-drop')` ❌
-   New API: `getCurrentWindow().onDragDropEvent()` ✅

## Development

```bash
# Install dependencies
bun install

# Run dev server
bun run tauri dev

# Build for production
bun run tauri build

# Debug build (with devtools)
bun run tauri build -- --debug
```

## Design Decisions

-   **No routing library**: Simple state-based view switching is sufficient
-   **No database**: Filesystem + JSON metadata cache
-   **MVP styling**: Minimal Tailwind classes, no custom design system
-   **Shuffle default**: Users prefer shuffle mode by default
-   **Blob URLs**: More reliable than asset protocol for audio playback
-   **Global audio element**: Prevents issues with unmounting/remounting pages
