import { ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDuration } from '@/utils/format'
import { cn } from '@/utils/cn'

export default function QueueItem({ entry, rank, onUpvote, hasVoted }) {
  const song = entry.song || {}
  const artistName = song.artist?.name || 'Unknown artist'
  return (
    <motion.div layout className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
      <span className="w-5 text-center text-xs font-mono text-mist">{rank}</span>
      <div className="w-11 h-11 rounded-lg shrink-0 bg-cover bg-center" style={{ background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-xs text-muted truncate">{artistName} · added by {entry.addedBy?.name || 'someone'}</p>
      </div>
      <span className="text-xs font-mono text-mist hidden sm:block">{song.duration ? formatDuration(song.duration) : ''}</span>
      <button
        onClick={() => !hasVoted && onUpvote?.(entry._id)}
        disabled={hasVoted}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 transition-colors',
          hasVoted ? 'bg-current/20 text-current-2 cursor-default' : 'bg-surface-2 hover:bg-current/20 text-current-2',
        )}
      >
        <ChevronUp size={14} />
        <span className="text-[11px] font-mono font-semibold">{entry.voteCount}</span>
      </button>
    </motion.div>
  )
}
