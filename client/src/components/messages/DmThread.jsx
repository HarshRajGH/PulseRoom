import { useEffect, useRef, useState } from 'react'
import { Send, Paperclip, X, Check, CheckCheck, Loader2, File as FileIcon } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

function StatusTicks({ status }) {
  if (status === 'read') return <CheckCheck size={13} className="text-current-2" />
  if (status === 'delivered') return <CheckCheck size={13} className="text-mist" />
  return <Check size={13} className="text-mist" />
}

export default function DmThread({
  conversation, messages, currentUserId, onSend, onTyping, onLoadMore, hasMore, loadingMore,
  typing, uploading, onUploadFile, isOnline,
}) {
  const [text, setText] = useState('')
  const [pendingAttachment, setPendingAttachment] = useState(null)
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)
  const other = conversation.participants.find((p) => p._id !== currentUserId)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, typing])

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() && !pendingAttachment) return
    onSend({ text: text.trim(), attachments: pendingAttachment ? [pendingAttachment] : [] })
    setText('')
    setPendingAttachment(null)
    onTyping(false)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const attachment = await onUploadFile(file)
    if (attachment) setPendingAttachment(attachment)
    e.target.value = ''
  }

  return (
    <div className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.06]">
        <div className="relative">
          <Avatar name={other?.name} src={other?.avatarUrl} size="sm" />
          {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface" />}
        </div>
        <div>
          <p className="font-semibold text-sm">{other?.name}</p>
          <p className="text-xs text-muted">{isOnline ? 'Online' : other?.handle}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {hasMore && (
          <button onClick={onLoadMore} disabled={loadingMore} className="w-full text-xs text-current-2 hover:underline py-1">
            {loadingMore ? 'Loading…' : 'Load earlier messages'}
          </button>
        )}
        {messages.length === 0 && <p className="text-sm text-muted text-center py-8">No messages yet — say hi 👋</p>}
        {messages.map((m) => {
          const mine = (m.sender?._id || m.sender) === currentUserId
          return (
            <div key={m._id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', mine ? 'bg-current text-white' : 'bg-surface-2')}>
                {m.attachments?.map((a, i) => (
                  a.type === 'image' ? (
                    <img key={i} src={a.url} alt={a.name} className="rounded-lg mb-2 max-h-52 object-cover" />
                  ) : (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 mb-2 text-xs">
                      <FileIcon size={14} /> {a.name || 'Attachment'}
                    </a>
                  )
                ))}
                {m.text && <p className="break-words">{m.text}</p>}
              </div>
              <div className={cn('flex items-center gap-1 mt-1 text-[10px] font-mono text-mist', mine && 'flex-row-reverse')}>
                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {mine && <StatusTicks status={m.status} />}
              </div>
            </div>
          )
        })}
        {typing && (
          <p className="text-xs text-muted italic">{other?.name} is typing…</p>
        )}
      </div>

      {pendingAttachment && (
        <div className="flex items-center gap-2 mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs">
          <FileIcon size={13} /> <span className="flex-1 truncate">{pendingAttachment.name}</span>
          <button onClick={() => setPendingAttachment(null)}><X size={13} /></button>
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-mist hover:text-paper shrink-0">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
        </button>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping(true) }}
          onBlur={() => onTyping(false)}
          placeholder="Message…"
          maxLength={2000}
          className="flex-1 rounded-full bg-surface-2 border border-white/10 px-4 py-2 text-sm outline-none focus:border-current/60"
        />
        <button type="submit" className="w-9 h-9 rounded-full bg-current text-white flex items-center justify-center shrink-0">
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
