import { useState, useRef, useEffect } from 'react'
import { Plus, ListMusic, Check, Loader2 } from 'lucide-react'
import { useListMyPlaylistsQuery, useAddTrackMutation } from '@/services/playlist.api'
import toast from 'react-hot-toast'

export default function AddToPlaylistMenu({ songId, onClose }) {
  const menuRef = useRef(null)
  const { data, isLoading } = useListMyPlaylistsQuery({ limit: 50 })
  const [addTrack] = useAddTrackMutation()
  const [adding, setAdding] = useState(null) // playlist id being added

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleAdd = async (playlistId, playlistName) => {
    setAdding(playlistId)
    try {
      await addTrack({ id: playlistId, songId }).unwrap()
      toast.success(`Added to "${playlistName}"`)
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add to playlist')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 bottom-full mb-2 z-50 w-56 rounded-xl border border-white/10 bg-[#181622] shadow-2xl overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <p className="text-xs font-semibold text-muted flex items-center gap-1.5">
          <ListMusic size={12} />Add to playlist
        </p>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-mist" /></div>
        ) : !data?.results?.length ? (
          <p className="text-xs text-muted text-center py-4 px-3">No playlists yet. Create one first.</p>
        ) : (
          data.results.map((p) => (
            <button
              key={p._id}
              onClick={() => handleAdd(p._id, p.name)}
              disabled={adding === p._id}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0 bg-cover bg-center"
                style={{ background: p.coverUrl ? `url(${p.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }}
              />
              <span className="flex-1 truncate">{p.name}</span>
              {adding === p._id
                ? <Loader2 size={12} className="animate-spin text-mist shrink-0" />
                : <Plus size={13} className="text-mist shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
