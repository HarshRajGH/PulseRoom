import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Radio } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import RoomCard from '@/components/room/RoomCard'
import { CardSkeletonGrid } from '@/components/ui/SkeletonGrid'
import { useListRoomsQuery } from '@/services/room.api'

export default function Rooms() {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching } = useListRoomsQuery({ live: filter === 'live' ? 'true' : undefined, page, limit: 9 })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="heading-eyebrow mb-1">Rooms</p>
          <h1 className="font-display text-3xl font-bold">Trending rooms</h1>
        </div>
        <Button as={Link} to="/app/rooms/create"><Plus size={16} /> Create room</Button>
      </div>
      <Tabs
        tabs={[{ label: 'All rooms', value: 'all' }, { label: 'Live now', value: 'live' }]}
        active={filter} onChange={(v) => { setFilter(v); setPage(1) }}
      />
      {isLoading ? (
        <CardSkeletonGrid count={9} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" />
      ) : data?.results?.length ? (
        <>
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            {data.results.map((r) => <RoomCard key={r._id} room={r} />)}
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} className="pt-4" />
        </>
      ) : (
        <EmptyState icon={Radio} title="No rooms found" description="Try a different filter, or start your own room." actionLabel="Create a room" onAction={() => window.location.assign('/app/rooms/create')} />
      )}
    </div>
  )
}
