import toast from 'react-hot-toast'
import { Check, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { useListPlansQuery, useGetMySubscriptionQuery, useSubscribeMutation, useCancelSubscriptionMutation } from '@/services/subscription.api'

const PLAN_FEATURES = {
  free: ['Join unlimited rooms', 'Basic chat', '1 playlist'],
  premium: ['Host unlimited rooms', 'Unlimited playlists', 'Offline downloads', 'Ad-free listening'],
  creator: ['Room analytics', 'Tips & wallet', 'Verified badge', 'Priority support'],
}

export default function Subscription() {
  const { data: plans, isLoading: plansLoading } = useListPlansQuery()
  const { data: mySub } = useGetMySubscriptionQuery()
  const [subscribe, { isLoading: subscribing }] = useSubscribeMutation()
  const [cancelSubscription] = useCancelSubscriptionMutation()

  const handleSubscribe = async (plan) => {
    try {
      await subscribe({ plan }).unwrap()
      toast.success(`Switched to ${plan} (mock checkout completed)`)
    } catch (err) {
      toast.error(err.message || 'Could not update subscription')
    }
  }

  if (plansLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={24} /></div>

  return (
    <div>
      <p className="heading-eyebrow mb-1">Subscription</p>
      <h1 className="font-display text-3xl font-bold mb-8">Premium plans</h1>
      <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
        {plans?.map((p) => {
          const isCurrent = mySub ? mySub.plan === p.plan : p.plan === 'free'
          return (
            <div key={p.plan} className={cn('card p-6 flex flex-col', isCurrent && 'border-current/50 shadow-glow')}>
              {isCurrent && <span className="heading-eyebrow mb-2">Current plan</span>}
              <h3 className="font-display text-lg font-bold mb-1 capitalize">{p.plan}</h3>
              <p className="font-display text-2xl font-bold mb-4">₹{p.priceMonthly}<span className="text-sm text-muted font-normal">/mo</span></p>
              <ul className="space-y-2 mb-6 flex-1">
                {(PLAN_FEATURES[p.plan] || []).map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check size={14} className="text-current-2 mt-0.5 shrink-0" />{f}</li>)}
              </ul>
              <Button
                variant={isCurrent ? 'subtle' : 'primary'} disabled={isCurrent || subscribing} className="w-full"
                onClick={() => handleSubscribe(p.plan)}
              >
                {isCurrent ? 'Active' : 'Switch plan'}
              </Button>
            </div>
          )
        })}
      </div>
      {mySub?.isActive && mySub.plan !== 'free' && (
        <Button variant="ghost" size="sm" className="mt-6" onClick={() => cancelSubscription()}>Cancel subscription</Button>
      )}
    </div>
  )
}
