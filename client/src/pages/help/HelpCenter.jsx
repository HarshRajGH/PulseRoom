import { useState } from 'react'
import { Search, ChevronDown, Radio, CreditCard, ShieldCheck, Music2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const faqs = [
  { q: 'How do I create a listening room?', a: 'Go to Rooms → Create room, name it, choose a genre and privacy setting, then hit Go live.', cat: 'Rooms' },
  { q: 'How does queue voting work?', a: 'Anyone in the room can add a track. Everyone can upvote tracks already in the queue — the highest-voted track plays next.', cat: 'Rooms' },
  { q: 'How do I cancel my subscription?', a: 'Go to Settings → Subscription and select a lower-tier plan, or contact support to cancel entirely.', cat: 'Billing' },
  { q: 'Can I get a refund?', a: 'Refunds are available within 7 days of a charge if you haven\'t used Premium features. Reach out via Contact.', cat: 'Billing' },
  { q: 'How do I block someone?', a: 'Open their profile, tap the overflow menu, and select Block. You can manage blocked users in Settings → Blocked users.', cat: 'Safety' },
  { q: 'Can I download songs for offline listening?', a: 'Yes — Premium and Creator plans include unlimited offline downloads from your Library.', cat: 'Music' },
]

const cats = { Rooms: Radio, Billing: CreditCard, Safety: ShieldCheck, Music: Music2 }

export default function HelpCenter() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="max-w-2xl">
      <p className="heading-eyebrow mb-1">Help Center</p>
      <h1 className="font-display text-3xl font-bold mb-6">How can we help?</h1>
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search FAQs…" className="w-full rounded-full bg-surface-2 border border-white/10 pl-11 pr-4 py-3 text-sm outline-none focus:border-current/60" />
      </div>
      <div className="space-y-2">
        {filtered.map((f, i) => {
          const Icon = cats[f.cat]
          return (
            <div key={f.q} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 p-4 text-left">
                <Icon size={16} className="text-current-2 shrink-0" />
                <span className="text-sm font-medium flex-1">{f.q}</span>
                <ChevronDown size={16} className={cn('text-mist transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="px-4 pb-4 pl-11 text-sm text-muted">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
