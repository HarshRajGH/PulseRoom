import { useEffect, useState } from 'react'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import SongRow from '@/components/music/SongRow'
import RoomCard from '@/components/room/RoomCard'
import EmptyState from '@/components/ui/EmptyState'
import { useLazyGlobalSearchQuery } from '@/services/search.api'

export default function Search() {
  const [q, setQ] = useState('')
  const [trigger, { data, isFetching }] = useLazyGlobalSearchQuery()

  useEffect(() => {
    if (!q.trim()) return
    const t = setTimeout(() => trigger(q), 300)
    return () => clearTimeout(t)
  }, [q, trigger])

  const results = data || {}

  return (
    <div className="space-y-8">
      <div className="relative max-w-xl">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="Search songs, artists, rooms…"
          className="w-full rounded-full bg-surface-2 border border-white/10 pl-11 pr-10 py-3 text-sm outline-none focus:border-current/60"
        />
        {isFetching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-mist animate-spin" />}
      </div>

      {q.trim() === '' ? (
        <EmptyState icon={SearchIcon} title="Search SyncWave" description="Find songs, rooms, playlists, and people across the whole platform." />
      ) : (
        <div className="space-y-8">
          {results.rooms?.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold mb-4">Rooms</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{results.rooms.map((r) => <RoomCard key={r._id} room={r} />)}</div>
            </section>
          )}
          {results.songs?.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold mb-4">Songs</h2>
              <div className="space-y-1">{results.songs.map((s, i) => <SongRow key={s._id} track={s} index={i + 1} />)}</div>
            </section>
          )}
          {!isFetching && !results.songs?.length && !results.rooms?.length && !results.playlists?.length && (
            <EmptyState icon={SearchIcon} title="No results" description={`Nothing matched "${q}". Try a different search term.`} />
          )}
        </div>
      )}
    </div>
  )
}
