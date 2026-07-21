import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import EqBars from '@/components/ui/EqBars'

export default function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <EqBars size="lg" color="ember" className="mb-6" />
      <h1 className="font-display text-6xl font-bold mb-3">500</h1>
      <p className="text-muted mb-8 max-w-sm">Something dropped out of sync on our end. We're already tuning it back in.</p>
      <Button as={Link} to="/">Back to home</Button>
    </div>
  )
}
