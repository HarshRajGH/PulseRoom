import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ListMusic, Search, Loader2 } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Pagination from '@/components/ui/Pagination'
import SongRow from '@/components/music/SongRow'
import EmptyState from '@/components/ui/EmptyState'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import { useListLikedSongsQuery } from '@/services/library.api'
import { useListSongsQuery } from '@/services/song.api'
import { useListMyPlaylistsQuery } from '@/services/playlist.api'

const tabs = [
  { label: 'Liked songs', value: 'liked' }, { label: 'Trending', value: 'trending' },
  { label: 'Playlists', value: 'playlists' },
]

const sortOptions = [
  { label: 'Recently liked', value: 'recent' }, { label: 'Oldest first', value: 'oldest' },
  { label: 'Title A–Z', value: 'title' }, { label: 'Most played', value: 'plays' },
]

export default function Library() {
  const [tab, setTab] = useState('liked')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')

  // Fully backend-driven: pagination, sorting, and search all happen
  // server-side against GET /library/liked — no client-side filtering.
  const { data: liked, isLoading: likedLoading, isFetching: likedFetching } = useListLikedSongsQuery(
    { page, limit: 20, sort, q: search || undefined },
    { skip: tab !== 'liked' },
  )
  const { data: trending, isLoading: trendingLoading } = useListSongsQuery({ limit: 24 }, { skip: tab !== 'trending' })
  const { data: playlists, isLoading: playlistsLoading } = useListMyPlaylistsQuery({ limit: 12 }, { skip: tab !== 'playlists' })

  return (
    <div className="space-y-6">
      <div>
        <p className="heading-eyebrow mb-1">Library</p>
        <h1 className="font-display text-3xl font-bold">Your collection</h1>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={(v) => { setTab(v); setPage(1) }} />

      {tab === 'liked' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search your liked songs…"
                className="w-full rounded-full bg-surface-2 border border-white/10 pl-9 pr-3 py-2 text-sm outline-none focus:border-current/60"
              />
            </div>
            <select
              value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="rounded-full bg-surface-2 border border-white/10 px-3 py-2 text-xs font-medium outline-none focus:border-current/60"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {likedFetching && <Loader2 size={14} className="text-mist animate-spin" />}
          </div>

          {likedLoading ? <RowSkeletonList /> : liked?.results?.length ? (
            <>
              <div className="space-y-1">{liked.results.map((t, i) => <SongRow key={t._id} track={t} index={i + 1 + (liked.pagination.page - 1) * liked.pagination.limit} />)}</div>
              <Pagination page={liked.pagination.page} totalPages={liked.pagination.totalPages} onChange={setPage} className="pt-4" />
            </>
          ) : (
            <EmptyState icon={Heart} title={search ? 'No matches' : 'No liked songs yet'} description={search ? `Nothing in your liked songs matches "${search}".` : 'Tap the heart on any track to save it here.'} />
          )}
        </div>
      )}

      {tab === 'trending' && (trendingLoading ? <RowSkeletonList /> : (
        <div className="space-y-1">{trending?.results?.map((t, i) => <SongRow key={t._id} track={t} index={i + 1} />)}</div>
      ))}

      {tab === 'playlists' && (playlistsLoading ? <RowSkeletonList /> : playlists?.results?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.results.map((p) => (
            <Link key={p._id} to={`/app/playlists/${p._id}`} className="card p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-xl shrink-0 bg-cover bg-center" style={{ background: p.coverUrl ? `url(${p.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }} />
              <div className="min-w-0"><p className="font-semibold truncate">{p.name}</p><p className="text-xs text-muted truncate">{p.tracks?.length || 0} tracks</p></div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={ListMusic} title="No playlists yet" description="Create one from the Playlists page." />
      ))}
    </div>
  )
}
