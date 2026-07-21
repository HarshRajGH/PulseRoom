import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import EqBars from '@/components/ui/EqBars'
import { formatCompactNumber } from '@/utils/format'

export default function RoomCard({ room }) {
  const hostName = room.host?.name || 'Unknown host'
  return (
    <Link to={`/app/rooms/${room._id}`} className="card p-4 group block transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:border-current/30">
      <div
        className="relative aspect-[4/3] rounded-xl mb-3 overflow-hidden flex items-end p-3 bg-cover bg-center"
        style={{ background: room.coverUrl ? `url(${room.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }}
      >
        {room.isLive && <Badge variant="live" dot className="absolute top-3 left-3">Live</Badge>}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-1 text-[11px] font-mono text-white">
          <Users size={11} /> {formatCompactNumber(room.listenerCount || 0)}
        </div>
        {room.isLive && <EqBars size="sm" color="white" className="absolute bottom-3 right-3" />}
      </div>
      <p className="text-sm font-semibold truncate">{room.name}</p>
      <p className="text-xs text-muted truncate mt-0.5">Hosted by {hostName}{room.genre ? ` · ${room.genre}` : ''}</p>
    </Link>
  )
}
