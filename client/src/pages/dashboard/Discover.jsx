import { useState } from 'react'
import MusicCard from '@/components/music/MusicCard'
import RoomCard from '@/components/room/RoomCard'
import { CardSkeletonGrid } from '@/components/ui/SkeletonGrid'
import { useListSongsQuery } from '@/services/song.api'
import { useListArtistsQuery } from '@/services/artist.api'
import { useListRoomsQuery } from '@/services/room.api'
import { formatCompactNumber } from '@/utils/format'

const categories = ['All', 'Synthwave', 'Lo-fi', 'Drum & Bass', 'Neo Soul', 'Post-Rock', 'Indie Folk']

export default function Discover() {
  const [category, setCategory] = useState('All')
  const genreFilter = category === 'All' ? undefined : category

  const { data: rooms, isLoading: roomsLoading } = useListRoomsQuery({ genre: genreFilter, limit: 9 })
  const { data: songs, isLoading: songsLoading } = useListSongsQuery({ genre: genreFilter, limit: 12 })
  const { data: artists, isLoading: artistsLoading } = useListArtistsQuery({ genre: genreFilter, limit: 6 })

  return (
    <div className="space-y-10">
      <div>
        <p className="heading-eyebrow mb-1">Discover</p>
        <h1 className="font-display text-3xl font-bold mb-5">Browse by category</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === c ? 'bg-current text-white' : 'bg-surface-2 text-mist hover:text-paper'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Rising rooms</h2>
        {roomsLoading ? <CardSkeletonGrid count={3} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms?.results?.map((r) => <RoomCard key={r._id} room={r} />)}
            {!rooms?.results?.length && <p className="text-sm text-muted col-span-full text-center py-6">No rooms match this category yet.</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Tracks</h2>
        {songsLoading ? <CardSkeletonGrid count={12} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {songs?.results?.map((s) => <MusicCard key={s._id} track={s} />)}
            {!songs?.results?.length && <p className="text-sm text-muted col-span-full text-center py-6">No tracks match this category yet.</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Artists to watch</h2>
        {artistsLoading ? <CardSkeletonGrid count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {artists?.results?.map((a) => (
              <div key={a._id} className="card p-4 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-cover bg-center" style={{ background: a.coverUrl ? `url(${a.coverUrl}) center/cover` : 'linear-gradient(135deg,#7C5CFF,#211D2E)' }} />
                <p className="text-sm font-semibold truncate">{a.name}</p>
                <p className="text-xs text-muted truncate">{formatCompactNumber(a.followers || 0)} followers</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
