import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import MiniPlayer from '@/components/music/MiniPlayer'
import GlobalAudioPlayer from '@/components/music/GlobalAudioPlayer'
import CommandPalette from '@/components/layout/CommandPalette'

export default function DashboardLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 px-4 lg:px-8 py-6 pb-32 lg:pb-24">
          <Outlet />
        </main>
      </div>
      <GlobalAudioPlayer />
      <MiniPlayer />
      <BottomNav />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
