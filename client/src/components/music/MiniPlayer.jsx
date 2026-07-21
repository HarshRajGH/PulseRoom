import { useDispatch, useSelector } from 'react-redux'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, Heart, Mic2 } from 'lucide-react'
import { togglePlay, setProgress, setVolume, toggleShuffle, cycleRepeat } from '@/store/slices/playerSlice'
import { useLikeSongMutation, useUnlikeSongMutation } from '@/services/library.api'
import { useRegisterPlayMutation } from '@/services/song.api'
import { formatDuration } from '@/utils/format'
import EqBars from '@/components/ui/EqBars'
import { cn } from '@/utils/cn'
import { useEffect, useRef } from 'react'

export default function MiniPlayer() {
  const dispatch = useDispatch()
  const { currentTrack, isPlaying, progress, volume, shuffled, repeat, activeRoomId } = useSelector((s) => s.player)
  const userId = useSelector((s) => s.auth.user?._id)
  const [likeSong] = useLikeSongMutation()
  const [unlikeSong] = useUnlikeSongMutation()
  const [registerPlay] = useRegisterPlayMutation()
  const playRegistered = useRef(null)

  useEffect(() => {
    if (currentTrack && isPlaying && playRegistered.current !== currentTrack._id) {
      playRegistered.current = currentTrack._id
      registerPlay(currentTrack._id)
    }
  }, [currentTrack, isPlaying, registerPlay])

  if (!currentTrack) return null

  const liked = currentTrack.likedBy?.includes(userId)
  const elapsed = Math.round((progress / 100) * currentTrack.duration)
  const artistName = currentTrack.artist?.name || 'Unknown artist'

  return (
    <div className="fixed bottom-0 lg:bottom-0 inset-x-0 z-40 mb-14 lg:mb-0">
      <div className="glass-solid border-t border-white/[0.06] px-4 py-2.5">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 w-56 shrink-0 min-w-0">
            <div className="w-11 h-11 rounded-lg shrink-0 bg-cover bg-center" style={{ background: currentTrack.coverUrl ? `url(${currentTrack.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted truncate">{artistName}{activeRoomId && <span className="text-current-2"> · synced to room</span>}</p>
            </div>
            <button onClick={() => (liked ? unlikeSong(currentTrack._id) : likeSong(currentTrack._id))} className="ml-1 shrink-0">
              <Heart size={15} className={liked ? 'fill-ember text-ember' : 'text-mist'} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => dispatch(toggleShuffle())} className={cn('text-mist hover:text-paper', shuffled && 'text-current-2')}>
                <Shuffle size={15} />
              </button>
              <button className="text-mist hover:text-paper"><SkipBack size={17} /></button>
              <button
                onClick={() => dispatch(togglePlay())}
                className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center shadow-glow hover:bg-current-2 transition-colors"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>
              <button className="text-mist hover:text-paper"><SkipForward size={17} /></button>
              <button onClick={() => dispatch(cycleRepeat())} className={cn('text-mist hover:text-paper', repeat !== 'off' && 'text-current-2')}>
                {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
              {isPlaying && <EqBars size="sm" className="hidden sm:flex" />}
            </div>
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-mist">
              <span>{formatDuration(elapsed)}</span>
              <input
                type="range" min={0} max={100} value={progress} disabled={Boolean(activeRoomId)}
                onChange={(e) => dispatch(setProgress(Number(e.target.value)))}
                className="flex-1 h-1 accent-current cursor-pointer disabled:cursor-not-allowed"
              />
              <span>{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 w-40 justify-end shrink-0">
            <Mic2 size={15} className="text-mist" />
            <Volume2 size={15} className="text-mist" />
            <input
              type="range" min={0} max={100} value={volume}
              onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
              className="w-20 h-1 accent-current cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
