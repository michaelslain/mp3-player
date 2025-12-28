import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Edit, Trash2 } from 'lucide-react';
import { Grid } from '../components/Grid';
import { SongCard } from '../components/SongCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { ContextMenu } from '../components/ContextMenu';
import { Path } from '../components/Path';
import { useAppState } from '../store/appStore';
import { useQueue } from '../hooks/useQueue';
import type { Playlist, MenuItem } from '../types';

export function GridPage() {
  const { path, setPath, setView, songs, playlists, refreshPlaylists } = useAppState();
  const { playQueue } = useQueue();
  const [contextMenu, setContextMenu] = useState<{
    playlist: Playlist;
    position: { x: number; y: number };
  } | null>(null);

  const handlePlaylistClick = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      setPath(['playlist', playlist.name]);
    }
  };

  const handleAllSongsClick = () => {
    setPath(['all_songs']);
  };

  const handleSongClick = (songId: string) => {
    // Get songs for current context
    let contextSongs = songs;
    if (path[0] === 'playlist') {
      const playlistName = path[1];
      const playlist = playlists.find((p) => p.name === playlistName);
      if (playlist) {
        contextSongs = songs.filter((s) => playlist.song_ids.includes(s.id));
      }
    }

    const songIndex = contextSongs.findIndex((s) => s.id === songId);
    if (songIndex !== -1) {
      playQueue(contextSongs, songIndex);
      setView('playing');
    }
  };

  const handlePathNavigate = (index: number) => {
    if (index === 0) {
      setPath(['all']);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, playlist: Playlist) => {
    e.preventDefault();
    setContextMenu({
      playlist,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleRenamePlaylist = async (playlist: Playlist) => {
    const newName = prompt('Enter new playlist name:', playlist.name);
    if (newName && newName !== playlist.name) {
      try {
        await invoke('rename_playlist', { id: playlist.id, newName });
        await refreshPlaylists();
      } catch (error) {
        console.error('Failed to rename playlist:', error);
        alert('Failed to rename playlist');
      }
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (confirm(`Delete playlist "${playlist.name}"?`)) {
      try {
        await invoke('delete_playlist', { id: playlist.id });
        await refreshPlaylists();
        if (path[0] === 'playlist' && path[1] === playlist.name) {
          setPath(['all']);
        }
      } catch (error) {
        console.error('Failed to delete playlist:', error);
        alert('Failed to delete playlist');
      }
    }
  };

  const handleRemoveSongFromPlaylist = async (songId: string) => {
    if (path[0] !== 'playlist') return;

    const playlistName = path[1];
    const playlist = playlists.find((p) => p.name === playlistName);
    if (!playlist) return;

    try {
      await invoke('remove_songs_from_playlist', {
        playlistId: playlist.id,
        songIds: [songId],
      });
      await refreshPlaylists();
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      alert('Failed to remove song from playlist');
    }
  };

  const contextMenuItems: MenuItem[] = contextMenu
    ? [
        {
          label: 'Rename',
          onClick: () => handleRenamePlaylist(contextMenu.playlist),
          icon: <Edit size={16} />,
        },
        {
          label: 'Delete',
          onClick: () => handleDeletePlaylist(contextMenu.playlist),
          icon: <Trash2 size={16} />,
        },
      ]
    : [];

  // Determine what to show
  const showAllPlaylists = path[0] === 'all';
  const showPlaylist = path[0] === 'playlist';
  const showAllSongs = path[0] === 'all_songs';

  const currentPlaylist = showPlaylist
    ? playlists.find((p) => p.name === path[1])
    : null;

  const playlistSongs = currentPlaylist
    ? songs.filter((s) => currentPlaylist.song_ids.includes(s.id))
    : [];

  const pathDisplay = path[0] === 'all' ? ['All'] : path[0] === 'all_songs' ? ['All', 'All Songs'] : ['All', path[1]];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Path path={pathDisplay} onNavigate={handlePathNavigate} />

      <div className="flex-1 overflow-y-auto">
        {showAllPlaylists && (
          <Grid>
            <PlaylistCard
              playlist={{
                id: 'all_songs',
                name: 'All Songs',
                song_ids: songs.map((s) => s.id),
                created_at: '',
              }}
              onClick={handleAllSongsClick}
            />
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => handlePlaylistClick(playlist.id)}
                onContextMenu={(e) => handleContextMenu(e, playlist)}
              />
            ))}
          </Grid>
        )}

        {showAllSongs && (
          <Grid>
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => handleSongClick(song.id)}
              />
            ))}
          </Grid>
        )}

        {showPlaylist && currentPlaylist && (
          <Grid>
            {playlistSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => handleSongClick(song.id)}
                onRemove={() => handleRemoveSongFromPlaylist(song.id)}
              />
            ))}
          </Grid>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
