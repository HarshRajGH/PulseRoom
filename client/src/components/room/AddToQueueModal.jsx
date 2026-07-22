import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Loader2, Music2, Check } from 'lucide-react'
import { useListSongsQuery } from '@/services/song.api'
import { useAddToQueueMutation } from '@/services/room.api'
import toast from 'react-hot-toast'
import { formatDuration } from '@/utils/format'

export default function AddToQueueModal({ roomId, onClose }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [adding, setAdding] = useState(null)
  const [added, setAdded] = useState(new Set())
  const inputRef = useRef(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const { data, isLoading, isFetching } = useListSongsQuery(
    { q: debouncedQuery || undefined, limit: 20 },
  )

  const [addToQueue] = useAddToQueueMutation()

  const handleAdd = async (song) => {
    setAdding(song._id)
    try {
      await addToQueue({ roomId, songId: song._id }).unwrap()
      setAdded((prev) => new Set([...prev, song._id]))
      toast.success(`"${song.title}" added to queue!`)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add song')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-lg mb-3">Add song to queue</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs by title, artist, genre…"
              className="w-full rounded-xl bg-surface-2 border border-white/10 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-current/60 transition-colors"
            />
            {isFetching && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist animate-spin" />}
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-mist" /></div>
          ) : !data?.results?.length ? (
            <div className="flex flex-col items-center py-10 gap-2 text-center">
              <Music2 size={28} className="text-mist" />
              <p className="text-sm text-muted">{query ? `No songs found for "${query}"` : 'No approved songs yet'}</p>
            </div>
          ) : data.results.map((song) => {
            const isAdded = added.has(song._id)
            const isProcessing = adding === song._id
            return (
              <div
                key={song._id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors group"
              >
                {/* Cover */}
                <div
                  className="w-10 h-10 rounded-lg shrink-0 bg-cover bg-center"
                  style={{ background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-muted truncate">{song.artist?.name || '–'} · {formatDuration(song.duration)}</p>
                </div>

                {/* Add button */}
                <button
                  onClick={() => !isAdded && handleAdd(song)}
                  disabled={isAdded || isProcessing}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-surface-2 hover:bg-current/20 text-mist hover:text-paper opacity-0 group-hover:opacity-100'
                  }`}
                  title={isAdded ? 'Added!' : 'Add to queue'}
                >
                  {isProcessing
                    ? <Loader2 size={13} className="animate-spin" />
                    : isAdded
                      ? <Check size={13} />
                      : <Plus size={13} />}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex justify-between items-center">
          <p className="text-xs text-muted">{added.size > 0 ? `${added.size} song${added.size > 1 ? 's' : ''} added` : 'Click + to add songs to the queue'}</p>
          <button onClick={onClose} className="text-sm text-mist hover:text-paper transition-colors">Done</button>
        </div>
      </div>
    </div>
  )
}
