import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Avatar from '@/components/ui/Avatar'
import { useLazyGlobalSearchQuery } from '@/services/search.api'

export default function NewMessageModal({ open, onClose, onSelectUser, currentUserId }) {
  const [q, setQ] = useState('')
  const [trigger, { data, isFetching }] = useLazyGlobalSearchQuery()

  useEffect(() => {
    if (!open || !q.trim()) return
    const t = setTimeout(() => trigger(q), 250)
    return () => clearTimeout(t)
  }, [q, open, trigger])

  const users = (data?.users || []).filter((u) => u._id !== currentUserId)

  return (
    <Modal open={open} onClose={onClose} title="New message">
      <input
        autoFocus value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search people by name or handle…"
        className="w-full rounded-full bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60 mb-4"
      />
      <div className="max-h-72 overflow-y-auto space-y-1">
        {isFetching && <p className="text-xs text-muted text-center py-4">Searching…</p>}
        {!isFetching && q.trim() && users.length === 0 && <p className="text-xs text-muted text-center py-4">No one found.</p>}
        {users.map((u) => (
          <button key={u._id} onClick={() => onSelectUser(u._id)} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 text-left">
            <Avatar name={u.name} src={u.avatarUrl} size="sm" />
            <div className="min-w-0"><p className="text-sm font-medium truncate">{u.name}</p><p className="text-xs text-muted truncate">{u.handle}</p></div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
