import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import EqBars from '@/components/ui/EqBars'
import Button from '@/components/ui/Button'
import Footer from '@/components/layout/Footer'

const links = [
  ['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact'],
]

export default function MarketingLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-current/15 flex items-center justify-center"><EqBars size="sm" /></div>
            <span className="font-display font-bold text-lg">SyncWave</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {links.map(([label, href]) => (
              <Link key={label} to={href} className="text-sm font-medium text-muted hover:text-paper transition-colors">{label}</Link>
            ))}
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-4">
            {links.map(([label, href]) => (
              <Link key={label} to={href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted">{label}</Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/login')}>Log in</Button>
              <Button size="sm" className="flex-1" onClick={() => navigate('/signup')}>Get Started</Button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
