import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import RoomCard from '@/components/room/RoomCard'
import MusicCard from '@/components/music/MusicCard'
import { CardSkeletonGrid } from '@/components/ui/SkeletonGrid'
import EmptyState from '@/components/ui/EmptyState'
import { useListRoomsQuery } from '@/services/room.api'
import { useListSongsQuery } from '@/services/song.api'
import { useListMyPlaylistsQuery } from '@/services/playlist.api'
import { useRecommendedSongsQuery } from '@/services/recommendation.api'
import EqBars from '@/components/ui/EqBars'
import { Radio, ListMusic } from 'lucide-react'

export default function Home() {
  const user = useSelector((s) => s.auth.user)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const { data: liveRooms, isLoading: roomsLoading } = useListRoomsQuery({ live: true, limit: 3 })
  const { data: recommended, isLoading: recsLoading } = useRecommendedSongsQuery(6)
  const { data: popularSongs, isLoading: popularLoading } = useListSongsQuery({ limit: 6 })
  const { data: playlists, isLoading: playlistsLoading } = useListMyPlaylistsQuery({ limit: 3 })

  const forYouSongs = recommended?.length ? recommended : popularSongs?.results
  const forYouLoading = recsLoading || popularLoading

  return (
    <div className="space-y-12">
      <div>
        <p className="heading-eyebrow mb-1">{greeting}</p>
        <h1 className="font-display text-3xl font-bold">{user?.name?.split(' ')[0]}, your rooms are warming up.</h1>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">Live now <EqBars size="sm" /></h2>
          <Link to="/app/rooms" className="text-sm font-semibold text-current-2 hover:underline">See all →</Link>
        </div>
        {roomsLoading ? (
          <CardSkeletonGrid count={3} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" />
        ) : liveRooms?.results?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveRooms.results.map((r) => <RoomCard key={r._id} room={r} />)}
          </div>
        ) : (
          <EmptyState icon={Radio} title="No rooms live right now" description="Be the first — start a room and invite friends in." actionLabel="Create a room" onAction={() => window.location.assign('/app/rooms/create')} />
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Made for you</h2>
          <Link to="/app/discover" className="text-sm font-semibold text-current-2 hover:underline">See all →</Link>
        </div>
        {forYouLoading ? <CardSkeletonGrid count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {forYouSongs?.map((s) => <MusicCard key={s._id} track={s} />)}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Your playlists</h2>
          <Link to="/app/playlists" className="text-sm font-semibold text-current-2 hover:underline">See all →</Link>
        </div>
        {playlistsLoading ? (
          <CardSkeletonGrid count={3} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" />
        ) : playlists?.results?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.results.map((p) => (
              <Link key={p._id} to={`/app/playlists/${p._id}`} className="card p-4 group flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-glow hover:border-current/30">
                <div className="w-16 h-16 rounded-xl shrink-0 bg-cover bg-center" style={{ background: p.coverUrl ? `url(${p.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }} />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted truncate mt-0.5">{p.description || `${p.tracks?.length || 0} tracks`}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={ListMusic} title="No playlists yet" description="Create your first playlist to start collecting tracks." actionLabel="Go to playlists" onAction={() => window.location.assign('/app/playlists')} />
        )}
      </section>
    </div>
  )
}
