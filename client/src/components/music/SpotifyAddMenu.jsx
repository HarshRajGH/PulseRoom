import { useState, useRef, useEffect } from 'react'
import { Plus, ListMusic, Check, Loader2, ExternalLink, Music2 } from 'lucide-react'
import { useListMyPlaylistsQuery, useAddTrackMutation } from '@/services/playlist.api'
import { useImportSpotifyTrackMutation } from '@/services/spotify.api'
import toast from 'react-hot-toast'

/**
 * SpotifyAddMenu
 *
 * Dropdown for Spotify tracks that lets the user:
 *  1. Import the Spotify track to local SyncWave database and add to selected playlist
 *  2. Open the full track on Spotify
 */
export default function SpotifyAddMenu({ track, onClose }) {
  const menuRef = useRef(null)
  const { data, isLoading } = useListMyPlaylistsQuery({ limit: 50 })
  const [addedIds, setAddedIds] = useState([])
  const [importSpotifyTrack] = useImportSpotifyTrackMutation()
  const [addTrack] = useAddTrackMutation()
  const [addingToPlaylistId, setAddingToPlaylistId] = useState(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleOpenSpotify = () => {
    if (track.externalUrl) window.open(track.externalUrl, '_blank', 'noopener')
    onClose()
  }

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    setAddingToPlaylistId(playlistId)
    const loadToast = toast.loading(`Importing "${track.title}" to playlist...`)
    
    try {
      let previewUrl = track.previewUrl

      // If Spotify preview is missing, resolve it via iTunes first so the song is playable
      if (!previewUrl) {
        try {
          const searchTerm = `${track.title} ${track.artist?.name || ''}`
          const itunesRes = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&limit=3&media=music`
          )
          const itunesData = await itunesRes.json()
          const itunesMatch = itunesData.results?.find((item) => item.previewUrl)
          if (itunesMatch) {
            previewUrl = itunesMatch.previewUrl
          }
        } catch (err) {
          console.warn('Failed to resolve iTunes preview for import:', err)
        }
      }

      // 1. Import Spotify track to database
      const payload = {
        spotifyId: track.spotifyId,
        title: track.title,
        artist: track.artist,
        album: track.album,
        coverUrl: track.coverUrl,
        audioUrl: previewUrl || '',
        duration: track.duration,
      }

      const song = await importSpotifyTrack(payload).unwrap()

      // 2. Add imported song to the SyncWave playlist
      await addTrack({ id: playlistId, songId: song._id }).unwrap()

      toast.success(`"${track.title}" added to "${playlistName}"! 🎵`, { id: loadToast })
      setAddedIds((prev) => [...prev, playlistId])
      setTimeout(onClose, 1000)
    } catch (error) {
      console.error('Import/Add error:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to add song to playlist.', { id: loadToast })
    } finally {
      setAddingToPlaylistId(null)
    }
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 bottom-full mb-2 z-50 w-64 rounded-xl border border-white/10 bg-[#181622] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-mist">
        <ListMusic size={12} className="text-current-2" />
        <span className="font-semibold uppercase tracking-wider">Add to Playlist</span>
      </div>

      {/* Playlist List */}
      <div className="max-h-48 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin text-current-2" size={16} />
          </div>
        ) : !data?.results?.length ? (
          <p className="text-xs text-muted text-center py-4 px-3">
            No playlists yet. Create one first.
          </p>
        ) : (
          data.results.map((p) => {
            const alreadyAdded = addedIds.includes(p._id)
            const isThisAdding = addingToPlaylistId === p._id
            return (
              <button
                key={p._id}
                onClick={() => !alreadyAdded && !isThisAdding && handleAddToPlaylist(p._id, p.name)}
                disabled={alreadyAdded || isThisAdding}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left disabled:opacity-60"
              >
                <div
                  className="w-7 h-7 rounded-lg shrink-0 bg-cover bg-center"
                  style={{ background: p.coverUrl ? `url(${p.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }}
                />
                <span className="flex-1 truncate">{p.name}</span>
                {alreadyAdded ? (
                  <Check size={12} className="text-current-2 shrink-0" />
                ) : isThisAdding ? (
                  <Loader2 size={12} className="animate-spin text-current-2 shrink-0" />
                ) : (
                  <Plus size={13} className="text-mist shrink-0" />
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Footer link to Spotify */}
      <div className="border-t border-white/5 bg-white/[0.01]">
        <button
          onClick={handleOpenSpotify}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-mist hover:text-paper hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={12} />
          <span>Open on Spotify</span>
        </button>
      </div>
    </div>
  )
}
