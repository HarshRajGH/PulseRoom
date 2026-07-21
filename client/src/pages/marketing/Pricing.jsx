import { useState } from 'react'
import { Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { cn } from '@/utils/cn'

const plans = [
  { name: 'Free', priceMonthly: 0, priceYearly: 0, blurb: 'Join rooms and listen along.', features: ['Join unlimited rooms', 'Vote on the queue', 'Basic chat', '1 playlist'], cta: 'Get started' },
  { name: 'Premium', priceMonthly: 149, priceYearly: 1299, blurb: 'For people who host and build.', features: ['Everything in Free', 'Host unlimited rooms', 'Unlimited playlists', 'Offline downloads', 'Ad-free listening'], cta: 'Start free trial', highlight: true },
  { name: 'Creator', priceMonthly: 349, priceYearly: 2999, blurb: 'For hosts building an audience.', features: ['Everything in Premium', 'Room analytics dashboard', 'Tips & wallet', 'Priority support', 'Verified badge'], cta: 'Start free trial' },
]

export default function Pricing() {
  const [cycle, setCycle] = useState('monthly')
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <p className="heading-eyebrow mb-2">Pricing</p>
      <h1 className="font-display text-4xl font-bold mb-4">Simple plans, no surprise cuts.</h1>
      <p className="text-muted max-w-md mx-auto mb-8">Start free. Upgrade when you're ready to host, build, and earn.</p>
      <Tabs
        className="mx-auto mb-14"
        tabs={[{ label: 'Monthly', value: 'monthly' }, { label: 'Yearly · save 25%', value: 'yearly' }]}
        active={cycle} onChange={setCycle}
      />
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {plans.map((p) => (
          <div key={p.name} className={cn('card p-7 flex flex-col', p.highlight && 'border-current/50 shadow-glow')}>
            {p.highlight && <span className="heading-eyebrow mb-3">Most popular</span>}
            <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
            <p className="text-sm text-muted mb-5">{p.blurb}</p>
            <p className="mb-6">
              <span className="font-display text-3xl font-bold">₹{cycle === 'monthly' ? p.priceMonthly : p.priceYearly}</span>
              <span className="text-muted text-sm">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={15} className="text-current-2 mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button variant={p.highlight ? 'primary' : 'ghost'} className="w-full">{p.cta}</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
