import { useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import EmptyState from '@/components/ui/EmptyState'
import { Flag } from 'lucide-react'
import { useListReportsQuery, useUpdateReportStatusMutation } from '@/services/report.api'

export default function ReportedMessages() {
  const [status, setStatus] = useState('pending')
  const { data, isLoading } = useListReportsQuery({ status })
  const [updateStatus] = useUpdateReportStatusMutation()

  const resolve = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap()
      toast.success(`Report ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[{ label: 'Pending', value: 'pending' }, { label: 'Resolved', value: 'resolved' }, { label: 'Dismissed', value: 'dismissed' }]}
        active={status} onChange={setStatus}
      />
      {isLoading ? <RowSkeletonList count={5} /> : (
        <div className="space-y-3">
          {data?.results?.length ? data.results.map((r) => (
            <div key={r._id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{r.reportedBy?.name} <span className="text-muted font-normal">reported a {r.targetType}</span></p>
                <p className="text-sm text-muted mt-0.5">{r.reason}</p>
              </div>
              <Badge variant={r.status === 'pending' ? 'live' : 'success'}>{r.status}</Badge>
              {r.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => resolve(r._id, 'dismissed')}>Dismiss</Button>
                  <Button size="sm" variant="ember" onClick={() => resolve(r._id, 'resolved')}>Resolve</Button>
                </div>
              )}
            </div>
          )) : <EmptyState icon={Flag} title="No reports" description="Nothing here for this filter." />}
        </div>
      )}
    </div>
  )
}
