import { TrendingUp, Users, Vote, Wallet as WalletIcon, Loader2 } from 'lucide-react'
import ListeningAreaChart from '@/components/charts/ListeningAreaChart'
import { useMyAnalyticsQuery } from '@/services/analytics.api'
import { useGetWalletQuery } from '@/services/wallet.api'
import { useListTipsReceivedQuery } from '@/services/wallet.api'
import { formatCurrency, formatCompactNumber } from '@/utils/format'

export default function CreatorDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useMyAnalyticsQuery(14)
  const { data: wallet, isLoading: walletLoading } = useGetWalletQuery()
  const { data: tips } = useListTipsReceivedQuery({ limit: 5 })

  const totals = (analytics || []).reduce(
    (acc, d) => ({
      listeningMinutes: acc.listeningMinutes + d.listeningMinutes,
      votes: acc.votes + d.votes,
      messages: acc.messages + d.messages,
    }),
    { listeningMinutes: 0, votes: 0, messages: 0 },
  )

  const kpis = [
    { icon: Users, label: 'Listening minutes (14d)', value: formatCompactNumber(totals.listeningMinutes) },
    { icon: TrendingUp, label: 'Messages sent (14d)', value: formatCompactNumber(totals.messages) },
    { icon: Vote, label: 'Votes cast (14d)', value: formatCompactNumber(totals.votes) },
    { icon: WalletIcon, label: 'Wallet balance', value: walletLoading ? '…' : formatCurrency(wallet?.balance || 0) },
  ]

  const chartData = (analytics || []).map((d) => ({ date: d.date.slice(5), minutes: d.listeningMinutes }))

  return (
    <div className="space-y-8">
      <div>
        <p className="heading-eyebrow mb-1">Creator Studio</p>
        <h1 className="font-display text-3xl font-bold">Your analytics</h1>
      </div>

      {analyticsLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={24} /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-5">
                <div className="w-9 h-9 rounded-xl bg-current/15 flex items-center justify-center mb-3"><Icon size={16} className="text-current-2" /></div>
                <p className="font-display text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold mb-4">Listening minutes (last 14 days)</h3>
            {chartData.length ? <ListeningAreaChart data={chartData} dataKey="minutes" /> : (
              <p className="text-sm text-muted text-center py-8">No activity recorded yet — analytics build up as your rooms get used.</p>
            )}
          </div>

          <section>
            <h3 className="font-display font-semibold mb-4">Recent tips</h3>
            <div className="space-y-2">
              {tips?.results?.length ? tips.results.map((t) => (
                <div key={t._id} className="card p-4 flex items-center justify-between">
                  <p className="text-sm">{t.from?.name} {t.note && <span className="text-muted">— {t.note}</span>}</p>
                  <span className="font-mono text-sm font-semibold text-current-2">+{formatCurrency(t.amount)}</span>
                </div>
              )) : <p className="text-sm text-muted text-center py-6">No tips yet.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
