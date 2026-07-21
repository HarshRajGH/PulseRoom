import EqBars from '@/components/ui/EqBars'

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <EqBars size="lg" className="mb-6" />
      <h1 className="font-display text-3xl font-bold mb-3">Tuning things up</h1>
      <p className="text-muted max-w-sm">SyncWave is undergoing scheduled maintenance. We'll be back live shortly.</p>
    </div>
  )
}
