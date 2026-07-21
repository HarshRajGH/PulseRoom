import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, MessageCircle, MapPin } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const cards = [
  { icon: Mail, title: 'Email us', text: 'support@syncwave.app' },
  { icon: MessageCircle, title: 'Live chat', text: 'Mon–Fri, 9am–6pm IST' },
  { icon: MapPin, title: 'Studio', text: 'Bengaluru, India' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const submit = (e) => { e.preventDefault(); setSent(true); toast.success('Message sent — we\'ll reply within a day.') }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14">
      <div>
        <p className="heading-eyebrow mb-2">Contact</p>
        <h1 className="font-display text-4xl font-bold mb-6">Questions, feedback, partnership ideas — we're listening.</h1>
        <div className="space-y-4">
          {cards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 card p-4">
              <div className="w-10 h-10 rounded-xl bg-current/15 flex items-center justify-center shrink-0"><Icon size={17} className="text-current-2" /></div>
              <div><p className="font-semibold text-sm">{title}</p><p className="text-sm text-muted">{text}</p></div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="card p-7 space-y-4 h-fit">
        <Input label="Your name" placeholder="Full name" required />
        <Input label="Email" type="email" placeholder="you@example.com" required />
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Message</span>
          <textarea rows={5} required placeholder="How can we help?" className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60 resize-none" />
        </label>
        <Button className="w-full" type="submit">{sent ? 'Sent!' : 'Send message'}</Button>
      </form>
    </div>
  )
}
