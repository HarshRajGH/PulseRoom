import { ShieldAlert, Ban, Flag, MessageSquareWarning } from 'lucide-react'

const tools = [
  { icon: Ban, title: 'Suspend user', desc: 'Temporarily restrict an account from joining or hosting rooms.' },
  { icon: MessageSquareWarning, title: 'Mute in room', desc: 'Silence a user\'s chat access within a specific room.' },
  { icon: Flag, title: 'Review flagged content', desc: 'Triage messages and rooms flagged by the community.' },
  { icon: ShieldAlert, title: 'Escalate to trust & safety', desc: 'Send serious cases to the full trust & safety team.' },
]

export default function Moderation() {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {tools.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-ember/15 flex items-center justify-center mb-4"><Icon size={18} className="text-ember-2" /></div>
          <p className="font-semibold mb-1.5">{title}</p>
          <p className="text-sm text-muted">{desc}</p>
        </div>
      ))}
    </div>
  )
}
