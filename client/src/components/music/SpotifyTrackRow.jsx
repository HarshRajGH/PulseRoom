import { useState } from 'react'
import { Play, ExternalLink, MoreHorizontal, Music2, Loader2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { playTrack, setActiveRoom } from '@/store/slices/playerSlice'
import { formatDuration } from '@/utils/format'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import SpotifyAddMenu from './SpotifyAddMenu'

/**
 * SpotifyTrackRow
 * Renders a single Spotify track with:
 *  - Play button  → plays the 30s preview (previewUrl) or finds local match
 *  - Add ⋯ menu  → pick a local SyncWave playlist to add reference, or open on Spotify
 *  - External link → opens the full track on Spotify
 */
export default function SpotifyTrackRow({ track, index }) {
  const dispatch = useDispatch()
  const [showMenu, setShowMenu] = useState(false)
  const [loadingLocal, setLoadingLocal] = useState(false)

  const handlePlay = async () => {
    setLoadingLocal(true)
    try {
      // 1. Try to search local DB for an existing imported/uploaded song
      const { data: res } = await apiClient.get('/songs', {
        params: { q: track.title, limit: 10 }
      })

      const localMatch = res?.data?.results?.find((song) => {
        const titleMatch = song.title.toLowerCase().includes(track.title.toLowerCase()) ||
                           track.title.toLowerCase().includes(song.title.toLowerCase())
        return titleMatch
      })

      // If local match exists and has a full YouTube URL or Cloudinary file (not a 30s preview), play it
      if (localMatch && localMatch.audioUrl && !localMatch.audioUrl.includes('itunes') && !localMatch.audioUrl.endsWith('.m4a') && !localMatch.audioUrl.includes('preview')) {
        dispatch(setActiveRoom(null))
        dispatch(playTrack(localMatch))
        return
      }

      // 2. Fetch full track via YouTube Search scraper endpoint on the backend
      const searchTerm = `${track.title} ${track.artist?.name || ''}`
      const ytRes = await apiClient.get('/songs/search-yt', {
        params: { q: searchTerm }
      })
      const videoId = ytRes?.data?.data?.videoId

      if (videoId) {
        dispatch(setActiveRoom(null))
        dispatch(playTrack({
          _id: `spotify:${track.spotifyId}`,
          title: track.title,
          artist: track.artist,
          album: track.album,
          coverUrl: track.coverUrl,
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration: track.duration || 240,
          isSpotifyTrack: true,
          externalUrl: track.externalUrl,
        }))
      } else if (track.previewUrl) {
        // Fallback: play 30s preview
        dispatch(setActiveRoom(null))
        dispatch(playTrack({
          _id: `spotify:${track.spotifyId}`,
          title: track.title,
          artist: track.artist,
          album: track.album,
          coverUrl: track.coverUrl,
          audioUrl: track.previewUrl,
          duration: track.duration,
          isSpotifyTrack: true,
          externalUrl: track.externalUrl,
        }))
      } else {
        toast.error('No stream found for this song.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Playback failed. Please try another track.')
    } finally {
      setLoadingLocal(false)
    }
  }

  return (
    <div className="group grid grid-cols-[2rem_1fr_auto_3.5rem] sm:grid-cols-[2rem_1fr_10rem_auto_3.5rem] items-center gap-4 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors">
      {/* Index / play */}
      <div className="relative flex items-center justify-center text-sm text-mist font-mono">
        {loadingLocal ? (
          <Loader2 size={14} className="animate-spin text-current-2" />
        ) : (
          <>
            <span className="group-hover:hidden">{index}</span>
            <button onClick={handlePlay} className="hidden group-hover:flex text-paper">
              <Play size={14} />
            </button>
          </>
        )}
      </div>

      {/* Cover + title + artist */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-lg shrink-0 bg-cover bg-center flex items-center justify-center relative overflow-hidden"
          style={{ background: track.coverUrl ? `url(${track.coverUrl}) center/cover` : 'linear-gradient(160deg,#1DB954,#0D0B14)' }}
        >
          {!track.coverUrl && <Music2 size={14} className="text-white/50" />}
          {/* Spotify green dot badge */}
          <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#1DB954] border border-[#0D0B14]" title="Spotify track" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{track.title}</p>
          <p className="text-xs text-muted truncate">{track.artist?.name}</p>
        </div>
      </div>

      {/* Album (hidden on mobile) */}
      <p className="hidden sm:block text-xs text-muted truncate">{track.album?.title || ''}</p>

      {/* Duration + preview badge */}
      <div className="flex items-center gap-2 justify-end">
        {!track.previewUrl && (
          <span className="hidden sm:inline text-[10px] text-mist/60 bg-white/5 rounded px-1.5 py-0.5">No preview</span>
        )}
        <span className="text-xs font-mono text-mist">{formatDuration(track.duration)}</span>
      </div>

      {/* Actions menu */}
      <div className="flex items-center gap-2 justify-end relative">
        <a
          href={track.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mist hover:text-[#1DB954] transition-colors"
          title="Open on Spotify"
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v) }}
          className="text-mist hover:text-paper transition-colors"
          title="Add to playlist"
        >
          <MoreHorizontal size={15} />
        </button>
        {showMenu && (
          <SpotifyAddMenu track={track} onClose={() => setShowMenu(false)} />
        )}
      </div>
    </div>
  )
}
