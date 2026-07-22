import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Heart, ListMusic, Search, Loader2, Upload, Trash2, Music, CheckCircle, Clock, XCircle, Music2, ChevronLeft, Play, ExternalLink } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Pagination from '@/components/ui/Pagination'
import SongRow from '@/components/music/SongRow'
import SpotifyTrackRow from '@/components/music/SpotifyTrackRow'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import UploadSongModal from '@/components/music/UploadSongModal'
import { useListLikedSongsQuery } from '@/services/library.api'
import { useListSongsQuery, useGetMySongsQuery, useDeleteSongMutation } from '@/services/song.api'
import { useListMyPlaylistsQuery } from '@/services/playlist.api'
import {
  useGetSpotifyLikedSongsQuery,
  useGetSpotifyPlaylistsQuery,
  useGetSpotifyPlaylistTracksQuery,
  useLazyGetSpotifyLinkUrlQuery,
} from '@/services/spotify.api'
import { playTrack, setActiveRoom } from '@/store/slices/playerSlice'
import toast from 'react-hot-toast'

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const tabs = [
  { label: 'Liked songs',       value: 'liked' },
  { label: 'Trending',          value: 'trending' },
  { label: 'Playlists',         value: 'playlists' },
  { label: 'My Uploads',        value: 'uploads' },
  { label: '♫ Spotify Liked',   value: 'spotify-liked' },
  { label: '♫ Spotify Playlists', value: 'spotify-playlists' },
]

const sortOptions = [
  { label: 'Recently liked', value: 'recent' },
  { label: 'Oldest first',   value: 'oldest' },
  { label: 'Title A–Z',      value: 'title' },
  { label: 'Most played',    value: 'plays' },
]

const statusConfig = {
  pending:  { icon: Clock,       label: 'Pending Review', cls: 'text-yellow-400 bg-yellow-400/10' },
  approved: { icon: CheckCircle, label: 'Live',           cls: 'text-emerald-400 bg-emerald-400/10' },
  rejected: { icon: XCircle,     label: 'Rejected',       cls: 'text-red-400 bg-red-400/10' },
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function UploadStatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

/** Shown when Spotify is not connected yet. */
function SpotifyConnectPrompt({ onConnect, isConnecting }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      {/* Spotify-branded icon */}
      <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 flex items-center justify-center ring-2 ring-[#1DB954]/30">
        <Music2 size={36} className="text-[#1DB954]" />
      </div>
      <div>
        <h3 className="font-display font-bold text-xl mb-2">Connect your Spotify</h3>
        <p className="text-sm text-muted max-w-xs">
          Link your Spotify account to browse your liked songs and playlists directly inside SyncWave.
        </p>
      </div>
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-[#1DB954] hover:bg-[#17a349] text-black font-bold border-0"
      >
        {isConnecting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Music2 size={14} className="mr-1.5" />}
        Connect Spotify
      </Button>
    </div>
  )
}

/** Spotify playlist card in the grid. */
function SpotifyPlaylistCard({ playlist, onClick }) {
  return (
    <button
      onClick={() => onClick(playlist)}
      className="card p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform text-left w-full"
    >
      <div
        className="w-14 h-14 rounded-xl shrink-0 bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ background: playlist.coverUrl ? `url(${playlist.coverUrl}) center/cover` : 'linear-gradient(150deg,#1DB954,#0D0B14)' }}
      >
        {!playlist.coverUrl && <Music2 size={20} className="text-white/40" />}
      </div>
      <div className="min-w-0">
        <p className="font-semibold truncate">{playlist.name}</p>
        <p className="text-xs text-muted truncate">{playlist.trackCount} tracks · {playlist.owner}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-[#1DB954]" />
          <span className="text-[10px] text-mist">Spotify</span>
        </div>
      </div>
    </button>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Spotify Liked Songs Tab
// ──────────────────────────────────────────────────────────────────────────────

function SpotifyLikedTab({ user }) {
  const [page, setPage] = useState(1)
  const [getLink, { isLoading: isConnecting }] = useLazyGetSpotifyLinkUrlQuery()

  const { data, isLoading, error } = useGetSpotifyLikedSongsQuery(
    { page, limit: 20 },
    { skip: !user?.spotifyConnected }
  )

  const handleConnect = async () => {
    try {
      const { data: res } = await getLink()
      if (res?.url) window.location.href = res.url
    } catch {
      toast.error('Could not get Spotify link URL')
    }
  }

  if (!user?.spotifyConnected) {
    return <SpotifyConnectPrompt onConnect={handleConnect} isConnecting={isConnecting} />
  }

  if (isLoading) return <RowSkeletonList />

  if (error) {
    return (
      <EmptyState
        icon={Music2}
        title="Could not load Spotify tracks"
        description={error.message || 'Please try reconnecting your Spotify account in Settings.'}
      />
    )
  }

  const tracks = data?.results || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
          <Music2 size={12} className="text-black" />
        </div>
        <span className="text-sm text-muted">
          {data?.pagination?.total ?? '—'} liked songs on Spotify
        </span>
      </div>

      {tracks.length ? (
        <>
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <SpotifyTrackRow
                key={t.spotifyId}
                track={t}
                index={i + 1 + (page - 1) * 20}
              />
            ))}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={setPage}
            className="pt-4"
          />
        </>
      ) : (
        <EmptyState
          icon={Heart}
          title="No liked songs on Spotify"
          description="Like some tracks on Spotify and they'll appear here."
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Spotify Playlists Tab
// ──────────────────────────────────────────────────────────────────────────────

function SpotifyPlaylistsTab({ user }) {
  const [page, setPage] = useState(1)
  const [openPlaylist, setOpenPlaylist] = useState(null) // { spotifyId, name, trackCount }
  const [tracksPage, setTracksPage] = useState(1)
  const [getLink, { isLoading: isConnecting }] = useLazyGetSpotifyLinkUrlQuery()

  const { data, isLoading, error } = useGetSpotifyPlaylistsQuery(
    { page, limit: 20 },
    { skip: !user?.spotifyConnected }
  )

  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
  } = useGetSpotifyPlaylistTracksQuery(
    { playlistId: openPlaylist?.spotifyId, page: tracksPage, limit: 20 },
    { skip: !openPlaylist }
  )

  const handleConnect = async () => {
    try {
      const { data: res } = await getLink()
      if (res?.url) window.location.href = res.url
    } catch {
      toast.error('Could not get Spotify link URL')
    }
  }

  if (!user?.spotifyConnected) {
    return <SpotifyConnectPrompt onConnect={handleConnect} isConnecting={isConnecting} />
  }

  if (isLoading) return <RowSkeletonList />

  if (error) {
    return (
      <EmptyState
        icon={Music2}
        title="Could not load Spotify playlists"
        description={error.message || 'Please try reconnecting your Spotify account in Settings.'}
      />
    )
  }

  const playlists = data?.results || []

  // ── Open playlist detail view ─────────────────────────────────────────────
  if (openPlaylist) {
    const tracks = tracksData?.results || []
    return (
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => { setOpenPlaylist(null); setTracksPage(1) }}
          className="flex items-center gap-2 text-sm text-mist hover:text-paper transition-colors"
        >
          <ChevronLeft size={16} /> Back to playlists
        </button>

        {/* Playlist header */}
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-16 h-16 rounded-2xl shrink-0 bg-cover bg-center"
            style={{ background: openPlaylist.coverUrl ? `url(${openPlaylist.coverUrl}) center/cover` : 'linear-gradient(150deg,#1DB954,#0D0B14)' }}
          />
          <div>
            <h2 className="font-display font-bold text-xl">{openPlaylist.name}</h2>
            <p className="text-xs text-muted">{openPlaylist.trackCount} tracks · {openPlaylist.owner}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#1DB954]" />
              <span className="text-[10px] text-mist">Spotify playlist</span>
            </div>
          </div>
        </div>

        {/* Track list */}
        {tracksLoading ? (
          <RowSkeletonList />
        ) : tracksError ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <Music2 size={24} className="text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-400 mb-1">Could not load tracks</p>
              <p className="text-xs text-muted max-w-xs">
                {tracksError.data?.message || tracksError.message || 'Spotify API error'}
              </p>
            </div>
            <a href="/app/settings" className="text-xs text-[#1DB954] underline underline-offset-2">
              Go to Settings → Disconnect &amp; reconnect Spotify
            </a>
          </div>
        ) : tracks.length ? (
          <>
            <div className="space-y-1">
              {tracks.map((t, i) => (
                <SpotifyTrackRow
                  key={t.spotifyId}
                  track={t}
                  index={i + 1 + (tracksPage - 1) * 20}
                />
              ))}
            </div>
            <Pagination
              page={tracksData.pagination.page}
              totalPages={tracksData.pagination.totalPages}
              onChange={setTracksPage}
              className="pt-4"
            />
          </>
        ) : (
          <EmptyState icon={ListMusic} title="No tracks in this playlist" description="This playlist appears to be empty." />
        )}
      </div>
    )
  }

  // ── Playlist grid ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
          <Music2 size={12} className="text-black" />
        </div>
        <span className="text-sm text-muted">
          {data?.pagination?.total ?? '—'} playlists on Spotify
        </span>
      </div>

      {playlists.length ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((p) => (
              <SpotifyPlaylistCard key={p.spotifyId} playlist={p} onClick={setOpenPlaylist} />
            ))}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={setPage}
            className="pt-4"
          />
        </>
      ) : (
        <EmptyState
          icon={ListMusic}
          title="No Spotify playlists"
          description="Your Spotify playlists will appear here once they're created."
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Library page
// ──────────────────────────────────────────────────────────────────────────────

export default function Library() {
  const user = useSelector((s) => s.auth.user)

  const [tab, setTab] = useState('liked')
  const [page, setPage] = useState(1)
  const [uploadsPage, setUploadsPage] = useState(1)
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const { data: liked, isLoading: likedLoading, isFetching: likedFetching } = useListLikedSongsQuery(
    { page, limit: 20, sort, q: search || undefined },
    { skip: tab !== 'liked' },
  )
  const { data: trending, isLoading: trendingLoading } = useListSongsQuery({ limit: 24 }, { skip: tab !== 'trending' })
  const { data: playlists, isLoading: playlistsLoading } = useListMyPlaylistsQuery({ limit: 12 }, { skip: tab !== 'playlists' })
  const { data: myUploads, isLoading: uploadsLoading } = useGetMySongsQuery({ page: uploadsPage, limit: 10 }, { skip: tab !== 'uploads' })
  const [deleteSong] = useDeleteSongMutation()

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteSong(id).unwrap()
      toast.success('Song deleted')
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="heading-eyebrow mb-1">Library</p>
          <h1 className="font-display text-3xl font-bold">Your collection</h1>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setShowUploadModal(true)} className="shrink-0 mt-2">
          <Upload size={14} className="mr-1.5" />Upload Song
        </Button>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={(v) => { setTab(v); setPage(1) }} />

      {/* ── Liked songs ───────────────────────────────────────────────────── */}
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
            <EmptyState icon={Heart} title={search ? 'No matches' : 'No liked songs yet'} description={search ? `Nothing matches "${search}".` : 'Tap the heart on any track to save it here.'} />
          )}
        </div>
      )}

      {/* ── Trending ──────────────────────────────────────────────────────── */}
      {tab === 'trending' && (trendingLoading ? <RowSkeletonList /> : (
        <div className="space-y-1">{trending?.results?.map((t, i) => <SongRow key={t._id} track={t} index={i + 1} />)}</div>
      ))}

      {/* ── Playlists ─────────────────────────────────────────────────────── */}
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

      {/* ── My Uploads ────────────────────────────────────────────────────── */}
      {tab === 'uploads' && (
        <div className="space-y-3">
          {uploadsLoading ? <RowSkeletonList /> : !myUploads?.results?.length ? (
            <EmptyState icon={Music} title="No uploads yet" description="Use the Upload Song button above to submit your first track." />
          ) : (
            <>
              {myUploads.results.map((song) => (
                <div key={song._id} className="card p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 bg-cover bg-center flex items-center justify-center"
                    style={{ background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'linear-gradient(135deg,#7C5CFF,#0D0B14)' }}
                  >
                    {!song.coverUrl && <Music size={16} className="text-white/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{song.title}</p>
                    <p className="text-xs text-muted truncate">{song.artist?.name || '–'}</p>
                    {song.status === 'rejected' && song.rejectionReason && (
                      <p className="text-xs text-red-400 mt-1 truncate">Reason: {song.rejectionReason}</p>
                    )}
                  </div>
                  <UploadStatusBadge status={song.status} />
                  {song.status !== 'approved' && (
                    <button
                      onClick={() => handleDelete(song._id, song.title)}
                      className="text-mist hover:text-red-400 transition-colors shrink-0"
                      title="Delete upload"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <Pagination page={myUploads.pagination?.page || 1} totalPages={myUploads.pagination?.totalPages || 1} onChange={setUploadsPage} className="pt-2" />
            </>
          )}
        </div>
      )}

      {/* ── Spotify Liked Songs ───────────────────────────────────────────── */}
      {tab === 'spotify-liked' && <SpotifyLikedTab user={user} />}

      {/* ── Spotify Playlists ─────────────────────────────────────────────── */}
      {tab === 'spotify-playlists' && <SpotifyPlaylistsTab user={user} />}

      {showUploadModal && <UploadSongModal onClose={() => setShowUploadModal(false)} />}
    </div>
  )
}
