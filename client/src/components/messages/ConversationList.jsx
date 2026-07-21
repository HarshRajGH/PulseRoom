import { Search, Trash2, Plus } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

export default function ConversationList({
  conversations, activeId, onSelect, onDelete, currentUserId,
  search, onSearchChange, onlineIds = new Set(), onNewMessage,
}) {
  return (
    <div className="card p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 px-1 mb-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="w-full rounded-full bg-surface-2 border border-white/10 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-current/60"
          />
        </div>
        <button onClick={onNewMessage} className="w-7 h-7 rounded-full bg-current/15 text-current-2 flex items-center justify-center shrink-0 hover:bg-current/25">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {conversations.length === 0 && <p className="text-xs text-muted text-center py-8">No conversations yet.</p>}
        {conversations.map((c) => {
          const other = c.participants.find((p) => p._id !== currentUserId)
          const isUnread = c.unread
          return (
            <div key={c._id} className={cn('group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left cursor-pointer transition-colors', activeId === c._id ? 'bg-current/15' : 'hover:bg-white/5')} onClick={() => onSelect(c)}>
              <div className="relative shrink-0">
                <Avatar name={other?.name || 'User'} src={other?.avatarUrl} size="sm" />
                {onlineIds.has(other?._id) && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm truncate', isUnread ? 'font-semibold' : 'font-medium')}>{other?.name || 'Unknown user'}</p>
                <p className={cn('text-xs truncate', isUnread ? 'text-paper' : 'text-muted')}>
                  {c.lastMessage?.text || (c.lastMessage?.attachments?.length ? '📎 Attachment' : 'Say hello 👋')}
                </p>
              </div>
              {isUnread && <span className="w-2 h-2 rounded-full bg-ember shrink-0" />}
              <button onClick={(e) => { e.stopPropagation(); onDelete(c._id) }} className="opacity-0 group-hover:opacity-100 text-mist hover:text-ember-2 shrink-0 transition-opacity">
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
