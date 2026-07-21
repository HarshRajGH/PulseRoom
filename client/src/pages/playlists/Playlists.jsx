import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Users, ListMusic } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { CardSkeletonGrid } from '@/components/ui/SkeletonGrid'
import { useListMyPlaylistsQuery, useCreatePlaylistMutation } from '@/services/playlist.api'
import { formatCompactNumber } from '@/utils/format'

export default function Playlists() {
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { data, isLoading } = useListMyPlaylistsQuery({ page, limit: 9 })
  const [createPlaylist, { isLoading: creating }] = useCreatePlaylistMutation()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createPlaylist({ name, description }).unwrap()
      toast.success('Playlist created')
      setOpen(false); setName(''); setDescription('')
    } catch (err) {
      toast.error(err.message || 'Could not create playlist')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="heading-eyebrow mb-1">Playlists</p>
          <h1 className="font-display text-3xl font-bold">My playlists</h1>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> New playlist</Button>
      </div>

      {isLoading ? (
        <CardSkeletonGrid count={6} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" />
      ) : data?.results?.length ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.results.map((p) => (
              <Link key={p._id} to={`/app/playlists/${p._id}`} className="card p-4 group block transition-all hover:-translate-y-1 hover:shadow-glow hover:border-current/30">
                <div className="aspect-square rounded-xl mb-3 bg-cover bg-center" style={{ background: p.coverUrl ? `url(${p.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }} />
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted truncate mt-0.5 mb-2">{p.description || 'No description'}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-mist">
                  <span>{p.tracks?.length || 0} tracks</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {formatCompactNumber(p.followers?.length || 0)}</span>
                  {p.isCollaborative && <span className="text-current-2">Collaborative</span>}
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} className="pt-4" />
        </>
      ) : (
        <EmptyState icon={ListMusic} title="No playlists yet" description="Create a playlist to start organizing tracks." actionLabel="New playlist" onAction={() => setOpen(true)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New playlist">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" placeholder="Late Night Drive" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description (optional)" placeholder="For empty highways." value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" className="w-full" disabled={creating}>{creating ? 'Creating…' : 'Create playlist'}</Button>
        </form>
      </Modal>
    </div>
  )
}
