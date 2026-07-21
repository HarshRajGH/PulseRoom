import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Radio, ListMusic, Music2, Loader2 } from 'lucide-react'
import { useLazyGlobalSearchQuery } from '@/services/search.api'

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [trigger, { data, isFetching }] = useLazyGlobalSearchQuery()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => { if (query.trim()) trigger(query) }, 250)
    return () => clearTimeout(t)
  }, [query, open, trigger])

  const results = data || { songs: [], rooms: [], playlists: [] }
  const go = (path) => { onClose(); setQuery(''); navigate(path) }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="relative w-full max-w-lg glass-solid rounded-2xl shadow-card overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search size={16} className="text-mist" />
              <input
                autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, rooms, playlists…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-mist"
              />
              {isFetching ? <Loader2 size={14} className="text-mist animate-spin" /> : <kbd className="text-[10px] font-mono text-mist border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>}
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {!query.trim() && <p className="px-3 py-6 text-center text-sm text-muted">Start typing to search SyncWave…</p>}

              {results.rooms?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-mist font-semibold">Rooms</p>
                  {results.rooms.map((r) => (
                    <button key={r._id} onClick={() => go(`/app/rooms/${r._id}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left">
                      <Radio size={14} className="text-current-2" /><span className="text-sm">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.playlists?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-mist font-semibold">Playlists</p>
                  {results.playlists.map((p) => (
                    <button key={p._id} onClick={() => go(`/app/playlists/${p._id}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left">
                      <ListMusic size={14} className="text-current-2" /><span className="text-sm">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.songs?.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-mist font-semibold">Songs</p>
                  {results.songs.map((s) => (
                    <button key={s._id} onClick={() => go('/app/library')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left">
                      <Music2 size={14} className="text-current-2" /><span className="text-sm">{s.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && !isFetching && !results.rooms?.length && !results.playlists?.length && !results.songs?.length && (
                <p className="px-3 py-6 text-center text-sm text-muted">No results for "{query}"</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
