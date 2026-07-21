import { Link, Outlet } from 'react-router-dom'
import EqBars from '@/components/ui/EqBars'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-14">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-current/15 flex items-center justify-center"><EqBars size="sm" /></div>
          <span className="font-display font-bold text-lg">SyncWave</span>
        </Link>
        <div className="w-full max-w-sm mx-auto py-16">
          <Outlet />
        </div>
        <p className="text-xs text-muted">© 2026 SyncWave, Inc.</p>
      </div>
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-current/20 via-ink to-ember/10 items-center justify-center">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(124,92,255,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,122,69,0.25), transparent 50%)' }} />
        <div className="relative z-10 text-center px-10 animate-floaty">
          <div className="flex items-end justify-center gap-2 mb-8">
            {[24, 44, 32, 60, 20, 48, 36].map((h, i) => (
              <div key={i} className="w-3 rounded-full bg-current/70" style={{ height: h }} />
            ))}
          </div>
          <h2 className="font-display text-3xl font-semibold max-w-sm mx-auto">Every room has a frequency. Find yours.</h2>
        </div>
      </div>
    </div>
  )
}
