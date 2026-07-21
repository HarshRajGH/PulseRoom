import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Vote, MessageSquare, Radio, ArrowRight, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import RoomCard from '@/components/room/RoomCard'
import { useListRoomsQuery } from '@/services/room.api'

const features = [
  { icon: Vote, title: 'Live queue voting', desc: "The room decides what plays next — upvote a track and watch it climb the queue in real time." },
  { icon: MessageSquare, title: 'Synced chat & lyrics', desc: 'Chat, reactions, and scrolling lyrics stay perfectly in time with whatever is playing.' },
  { icon: Radio, title: 'Host your own room', desc: 'Spin up a listening room in seconds and invite friends — public or invite-only.' },
  { icon: Users, title: 'Built for groups', desc: 'From a two-person call to a 500-listener room, SyncWave scales the same experience.' },
]

const stats = [
  ['312', 'rooms live right now'], ['84K', 'listeners this week'], ['1.2M', 'votes cast this month'],
]

export default function Landing() {
  const { data: liveRooms, isLoading: roomsLoading } = useListRoomsQuery({ live: true, limit: 3 })
  const liveCount = liveRooms?.pagination?.total ?? liveRooms?.results?.length ?? 0

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Badge variant="current" dot className="mb-6">{roomsLoading ? 'Loading rooms…' : `${liveCount} room${liveCount === 1 ? '' : 's'} live right now`}</Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            One playlist.<br />Everyone's <span className="text-current-2">frequency.</span>
          </h1>
          <p className="text-muted text-lg max-w-lg mb-8">
            SyncWave turns listening into something you do together — vote on the queue, chat in real time, and keep a room's energy moving without one person holding the aux cord.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button as={Link} to="/signup" size="lg">Start a room <ArrowRight size={16} /></Button>
            <Button as={Link} to="/app/rooms" variant="ghost" size="lg"><Play size={15} /> Browse live rooms</Button>
          </div>
          <div className="flex items-center gap-8 mt-12">
            {stats.map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-bold">{n}</p>
                <p className="text-xs text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <div className="card p-5 animate-floaty">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-semibold">Basement Voltage</p>
              <Badge variant="live" dot>Live · 542</Badge>
            </div>
            <div className="space-y-2">
              {[
                { t: 'Voltage Garden', a: 'Kilo Static', v: 34 },
                { t: 'Afterglow', a: 'Nova Halcyon', v: 21 },
                { t: 'Static Coastlines', a: 'The Low Orbit', v: 15 },
              ].map((s) => (
                <div key={s.t} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-current to-ember shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.t}</p>
                    <p className="text-xs text-muted truncate">{s.a}</p>
                  </div>
                  <span className="text-xs font-mono text-current-2">▲ {s.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 card p-4 hidden sm:block">
            <div className="flex items-end gap-1.5" style={{ height: 30 }}>
              {[14, 26, 10, 30, 18, 24, 12].map((h, i) => (
                <div key={i} className="w-2 rounded-full bg-ember animate-[barpulse_1s_ease-in-out_infinite]" style={{ height: h, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="heading-eyebrow mb-2">Why rooms feel different here</p>
        <h2 className="font-display text-3xl font-bold mb-12 max-w-lg">Every listener gets a vote, not just a view.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-current/15 flex items-center justify-center mb-4"><Icon size={18} className="text-current-2" /></div>
              <p className="font-semibold mb-1.5">{title}</p>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="heading-eyebrow mb-2">Right now</p>
            <h2 className="font-display text-3xl font-bold">Rooms trending tonight</h2>
          </div>
          <Link to="/app/rooms" className="text-sm font-semibold text-current-2 hover:underline hidden sm:block">See all rooms →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(liveRooms?.results || []).slice(0, 3).map((r) => <RoomCard key={r._id} room={r} />)}
          {!roomsLoading && !liveRooms?.results?.length && (
            <p className="text-sm text-muted col-span-full text-center py-6">No rooms are live this second — check back soon, or start one yourself.</p>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Your next playlist has a room waiting.</h2>
        <p className="text-muted mb-8 max-w-md mx-auto">No downloads, no credit card. Start listening together in under a minute.</p>
        <Button as={Link} to="/signup" size="lg">Create your free account</Button>
      </section>
    </div>
  )
}
