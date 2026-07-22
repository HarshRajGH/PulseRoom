import { useState } from 'react'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { playTrack, setActiveRoom } from '@/store/slices/playerSlice'
import { useLikeSongMutation, useUnlikeSongMutation } from '@/services/library.api'
import { formatDuration } from '@/utils/format'
import AddToPlaylistMenu from './AddToPlaylistMenu'

export default function SongRow({ track, index }) {
  const dispatch = useDispatch()
  const userId = useSelector((s) => s.auth.user?._id)
  const [likeSong] = useLikeSongMutation()
  const [unlikeSong] = useUnlikeSongMutation()
  const currentId = useSelector((s) => s.player.currentTrack?._id)
  const liked = track.likedBy?.includes(userId)
  const artistName = track.artist?.name || 'Unknown artist'
  const active = currentId === track._id
  const [showMenu, setShowMenu] = useState(false)

  const play = () => {
    dispatch(setActiveRoom(null))
    dispatch(playTrack(track))
  }

  const toggleLike = () => (liked ? unlikeSong(track._id) : likeSong(track._id))

  return (
    <div className="group grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_10rem_auto_3rem] items-center gap-4 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors">
      <div className="relative flex items-center justify-center text-sm text-mist font-mono">
        <span className="group-hover:hidden">{active ? <span className="text-current-2">♪</span> : index}</span>
        <button onClick={play} className="hidden group-hover:flex text-paper">
          <Play size={14} />
        </button>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg shrink-0 bg-cover bg-center" style={{ background: track.coverUrl ? `url(${track.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }} />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${active ? 'text-current-2' : ''}`}>{track.title}</p>
          <p className="text-xs text-muted truncate">{artistName}</p>
        </div>
      </div>
      <p className="hidden sm:block text-xs text-muted truncate">{track.album?.title || track.genre || ''}</p>
      <button onClick={toggleLike} className="justify-self-end">
        <Heart size={14} className={liked ? 'fill-ember text-ember' : 'text-mist'} />
      </button>
      <div className="hidden sm:flex items-center gap-3 justify-end">
        <span className="text-xs font-mono text-mist">{formatDuration(track.duration)}</span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v) }}
            title="Add to playlist"
            className="text-mist hover:text-paper transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>
          {showMenu && <AddToPlaylistMenu songId={track._id} onClose={() => setShowMenu(false)} />}
        </div>
      </div>
    </div>
  )
}

