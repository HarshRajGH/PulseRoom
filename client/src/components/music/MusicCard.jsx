import { useState } from 'react'
import { Play, Heart, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { playTrack, setActiveRoom } from '@/store/slices/playerSlice'
import { useLikeSongMutation, useUnlikeSongMutation } from '@/services/library.api'
import { formatCompactNumber } from '@/utils/format'
import AddToPlaylistMenu from './AddToPlaylistMenu'

export default function MusicCard({ track }) {
  const dispatch = useDispatch()
  const userId = useSelector((s) => s.auth.user?._id)
  const [likeSong] = useLikeSongMutation()
  const [unlikeSong] = useUnlikeSongMutation()
  const liked = track.likedBy?.includes(userId)
  const artistName = track.artist?.name || 'Unknown artist'
  const [showMenu, setShowMenu] = useState(false)

  const play = () => {
    dispatch(setActiveRoom(null))
    dispatch(playTrack(track))
  }

  const toggleLike = (e) => {
    e.stopPropagation()
    liked ? unlikeSong(track._id) : likeSong(track._id)
  }

  return (
    <div className="card p-3 group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:border-current/30 relative">
      <div
        className="relative aspect-square rounded-xl mb-3 overflow-hidden bg-cover bg-center"
        style={{ background: track.coverUrl ? `url(${track.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }}
      >
        {/* Play button */}
        <button
          onClick={play}
          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-current text-white flex items-center justify-center shadow-glow opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        >
          <Play size={14} className="ml-0.5" />
        </button>

        {/* Add to playlist button — top-right, on hover */}
        <div className="absolute top-2 right-2 relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v) }}
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="Add to playlist"
          >
            <Plus size={13} />
          </button>
          {showMenu && <AddToPlaylistMenu songId={track._id} onClose={() => setShowMenu(false)} />}
        </div>
      </div>

      <p className="text-sm font-semibold truncate">{track.title}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-muted truncate">{artistName}</p>
        <button onClick={toggleLike} className="shrink-0 ml-2">
          <Heart size={13} className={liked ? 'fill-ember text-ember' : 'text-mist'} />
        </button>
      </div>
      <p className="text-[10px] font-mono text-mist mt-1">{formatCompactNumber(track.plays || 0)} plays</p>
    </div>
  )
}
