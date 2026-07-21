import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import { useListRoomsQuery } from '@/services/room.api'
import { formatCompactNumber } from '@/utils/format'

export default function ManageRooms() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListRoomsQuery({ page, limit: 20 })

  if (isLoading) return <RowSkeletonList count={8} />

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-mist uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Room</th><th className="px-5 py-3 font-medium">Host</th>
              <th className="px-5 py-3 font-medium">Listeners</th><th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((r) => (
              <tr key={r._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cover bg-center" style={{ background: r.coverUrl ? `url(${r.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }} />
                    <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted">{r.genre}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{r.host?.name}</td>
                <td className="px-5 py-3 font-mono text-xs">{formatCompactNumber(r.listenerCount || 0)}</td>
                <td className="px-5 py-3">{r.isLive ? <Badge variant="live" dot>Live</Badge> : <Badge variant="neutral">Offline</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} className="py-4" />}
    </div>
  )
}
