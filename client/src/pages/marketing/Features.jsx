import { Vote, MessageSquare, Radio, ListMusic, Mic2, ShieldCheck, LineChart, Users2 } from 'lucide-react'

const groups = [
  { title: 'The room', items: [
    { icon: Radio, title: 'Instant rooms', desc: 'Spin up a public or invite-only room in seconds — no setup, no waiting.' },
    { icon: Vote, title: 'Democratic queue', desc: 'Anyone can add a track; everyone votes on what plays next.' },
    { icon: Users2, title: 'Live presence', desc: 'See who\'s listening, who\'s typing, and who just walked in.' },
  ]},
  { title: 'The experience', items: [
    { icon: MessageSquare, title: 'Real-time chat', desc: 'Reactions and messages stay perfectly synced to the track timeline.' },
    { icon: Mic2, title: 'Scrolling lyrics', desc: 'Follow along line by line, auto-highlighted as the song plays.' },
    { icon: ListMusic, title: 'Collaborative playlists', desc: 'Build playlists with friends — everyone can add, reorder, and vote.' },
  ]},
  { title: 'For creators', items: [
    { icon: LineChart, title: 'Room analytics', desc: 'Track listening time, votes, and growth for every room you host.' },
    { icon: ShieldCheck, title: 'Moderation tools', desc: 'Mute, block, and report — built in from day one, not bolted on.' },
  ]},
]

export default function Features() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="heading-eyebrow mb-2">Features</p>
      <h1 className="font-display text-4xl font-bold max-w-xl mb-4">Everything a listening room needs, nothing it doesn't.</h1>
      <p className="text-muted max-w-lg mb-16">SyncWave is built around one idea: the best playlists are made by more than one person.</p>
      <div className="space-y-16">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-display text-xl font-semibold mb-6 pb-3 border-b border-white/[0.06]">{g.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {g.items.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-5">
                  <div className="w-10 h-10 rounded-xl bg-current/15 flex items-center justify-center mb-4"><Icon size={18} className="text-current-2" /></div>
                  <p className="font-semibold mb-1.5">{title}</p>
                  <p className="text-sm text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
