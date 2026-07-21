import { Link } from 'react-router-dom'
import EqBars from '@/components/ui/EqBars'

const cols = [
  { title: 'Product', links: [['Features', '/features'], ['Pricing', '/pricing'], ['Rooms', '/app/rooms']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Help Center', '/app/help']] },
  { title: 'Legal', links: [['Privacy', '/app/settings/privacy'], ['Security', '/app/settings/security']] },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-current/15 flex items-center justify-center"><EqBars size="sm" /></div>
            <span className="font-display font-bold text-lg">SyncWave</span>
          </div>
          <p className="text-sm text-muted max-w-xs">Collaborative playlists and live listening parties, tuned to whoever's in the room.</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-mist mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-muted hover:text-paper transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] py-6 text-center text-xs text-muted">© 2026 SyncWave, Inc. All frequencies reserved.</div>
    </footer>
  )
}
