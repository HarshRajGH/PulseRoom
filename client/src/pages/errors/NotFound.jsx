import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import EqBars from '@/components/ui/EqBars'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <EqBars size="lg" className="mb-6" />
      <h1 className="font-display text-6xl font-bold mb-3">404</h1>
      <p className="text-muted mb-8 max-w-sm">This frequency doesn't exist. The page you're looking for may have moved or never played at all.</p>
      <Button as={Link} to="/">Back to home</Button>
    </div>
  )
}
