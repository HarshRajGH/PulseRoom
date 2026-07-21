// Signature element: an equalizer/waveform bar cluster used across the app
// as the "live" indicator, loading state, and decorative divider.
import { cn } from '@/utils/cn'

const HEIGHTS = [10, 16, 8, 20, 12]
const DELAYS = [0, 0.12, 0.24, 0.08, 0.18]

export default function EqBars({ size = 'md', color = 'current', active = true, className }) {
  const barHeight = size === 'sm' ? 10 : size === 'lg' ? 24 : 16
  const colorClass = color === 'ember' ? 'bg-ember' : color === 'white' ? 'bg-white' : 'bg-current'
  return (
    <span className={cn('eq-bars', className)} style={{ height: barHeight }} aria-hidden="true">
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn('eq-bar', colorClass)}
          style={{
            height: `${(h / 20) * barHeight}px`,
            animationDelay: `${DELAYS[i]}s`,
            animationPlayState: active ? 'running' : 'paused',
          }}
        />
      ))}
    </span>
  )
}
