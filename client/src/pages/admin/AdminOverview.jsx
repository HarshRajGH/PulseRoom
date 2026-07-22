import { Users, Radio, Flag, IndianRupee, Loader2, Music } from 'lucide-react'
import { useDashboardStatsQuery } from '@/services/admin.api'
import { usePlatformOverviewQuery } from '@/services/analytics.api'
import { formatCompactNumber, formatCurrency } from '@/utils/format'

export default function AdminOverview() {
  const { data: stats, isLoading } = useDashboardStatsQuery()
  const { data: overview } = usePlatformOverviewQuery()

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={24} /></div>

  const kpis = [
    { icon: Users, label: 'Total users', value: formatCompactNumber(stats?.totalUsers || 0) },
    { icon: Radio, label: 'Active rooms', value: stats?.activeRoomsCount || 0 },
    { icon: Flag, label: 'Open reports', value: stats?.openReports || 0 },
    { icon: Music, label: 'Pending songs', value: stats?.pendingSongs || 0 },
    { icon: IndianRupee, label: 'Revenue (MTD)', value: formatCurrency(stats?.revenueMTD || overview?.revenueMTD || 0) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <div className="w-9 h-9 rounded-xl bg-current/15 flex items-center justify-center mb-3"><Icon size={16} className="text-current-2" /></div>
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">Platform-wide charts (genre/growth breakdowns) roll up from the same `/analytics` endpoints used in Creator Studio — see that page for the chart components in action against per-user data.</p>
    </div>
  )
}
