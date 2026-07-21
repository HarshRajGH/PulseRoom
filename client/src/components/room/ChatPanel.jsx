import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

export default function ChatPanel({ messages, onSend, onTyping, typingUsers = [] }) {
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typingUsers])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
    onTyping?.(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && <p className="text-sm text-muted text-center py-8">No messages yet — say hi 👋</p>}
        {messages.map((m) => (
          <div key={m._id} className="flex items-start gap-2.5">
            <Avatar name={m.sender?.name || 'User'} src={m.sender?.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-muted">{m.sender?.name || 'User'} · <span className="font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
              <p className="text-sm break-words">{m.text}</p>
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <p className="text-xs text-muted italic">{typingUsers.map((u) => u.name).join(', ')} typing…</p>
        )}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping?.(true) }}
          onBlur={() => onTyping?.(false)}
          placeholder="Say something…"
          maxLength={500}
          className="flex-1 rounded-full bg-surface-2 border border-white/10 px-4 py-2 text-sm outline-none focus:border-current/60"
        />
        <button type="submit" className="w-9 h-9 rounded-full bg-current text-white flex items-center justify-center shrink-0">
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
