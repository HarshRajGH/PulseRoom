import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Play, Users, Share2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import SongRow from '@/components/music/SongRow'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import { useGetPlaylistQuery, useRemoveTrackMutation, useToggleFollowPlaylistMutation, useDeletePlaylistMutation } from '@/services/playlist.api'
import { formatCompactNumber } from '@/utils/format'
import { playTrack, setActiveRoom } from '@/store/slices/playerSlice'
import { useNavigate } from 'react-router-dom'

export default function PlaylistDetails() {
  const { playlistId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((s) => s.auth.user)
  const { data: playlist, isLoading } = useGetPlaylistQuery(playlistId)
  const [removeTrack] = useRemoveTrackMutation()
  const [toggleFollow] = useToggleFollowPlaylistMutation()
  const [deletePlaylist, { isLoading: deleting }] = useDeletePlaylistMutation()

  if (isLoading || !playlist) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-current-2" size={28} /></div>
  }

  const isOwner = playlist.owner?._id === currentUser?._id
  const tracks = playlist.tracks || []
  const following = playlist.followers?.includes(currentUser?._id)

  const handleDelete = async () => {
    if (!window.confirm('Delete this playlist? This can\'t be undone.')) return
    try {
      await deletePlaylist(playlistId).unwrap()
      toast.success('Playlist deleted')
      navigate('/app/playlists')
    } catch (err) {
      toast.error(err.message || 'Could not delete playlist')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
        <div className="w-40 h-40 rounded-2xl shrink-0 shadow-card bg-cover bg-center" style={{ background: playlist.coverUrl ? `url(${playlist.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }} />
        <div className="flex-1">
          {playlist.isCollaborative && <p className="heading-eyebrow mb-2">Collaborative playlist</p>}
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-muted text-sm mb-3">{playlist.description || 'No description yet.'}</p>
          <div className="flex items-center gap-4 text-xs text-mist font-mono">
            <span>{tracks.length} tracks</span>
            <span className="flex items-center gap-1"><Users size={12} /> {formatCompactNumber(playlist.followers?.length || 0)} followers</span>
            <span>by {playlist.owner?.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={() => { if (tracks[0]) { dispatch(setActiveRoom(null)); dispatch(playTrack(tracks[0])) } }}
              disabled={!tracks.length}
            >
              <Play size={15} className="ml-0.5" /> Play all
            </Button>
            {!isOwner && (
              <Button variant={following ? 'subtle' : 'ghost'} onClick={() => toggleFollow(playlistId)}>{following ? 'Following' : 'Follow'}</Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied') }}><Share2 size={15} /></Button>
            {isOwner && <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}><Trash2 size={15} className="text-ember-2" /></Button>}
          </div>
        </div>
      </div>
      {tracks.length ? (
        <div className="space-y-1">
          {tracks.map((t, i) => (
            <div key={t._id} className="group relative">
              <SongRow track={t} index={i + 1} />
              {isOwner && (
                <button
                  onClick={() => removeTrack({ id: playlistId, songId: t._id })}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-mist hover:text-ember-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {!tracks.length && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Play size={24} className="text-mist" />
          </div>
          <div>
            <p className="font-semibold mb-1">No tracks yet</p>
            <p className="text-sm text-muted">Find songs to add using the buttons below</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <a href="/app/discover" className="inline-flex items-center gap-2 rounded-full bg-current px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Browse Discover
            </a>
            <a href="/app/search" className="inline-flex items-center gap-2 rounded-full bg-surface-2 border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors">
              Search songs
            </a>
            <a href="/app/library" className="inline-flex items-center gap-2 rounded-full bg-surface-2 border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors">
              Go to Library
            </a>
          </div>
          <p className="text-xs text-muted">Then click the <strong>⋯ three-dot button</strong> on any song to add it here</p>
        </div>
      )}
    </div>
  )
}
