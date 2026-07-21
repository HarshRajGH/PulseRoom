import { useState } from 'react'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import { useListUsersQuery } from '@/services/user.api'
import apiClient from '@/services/apiClient'
import { baseApi } from '@/services/baseApi'
import { useDispatch } from 'react-redux'

export default function ManageUsers() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListUsersQuery({ page, limit: 20 })
  const dispatch = useDispatch()

  const act = async (id, action) => {
    try {
      await apiClient.patch(`/users/${id}/${action}`)
      toast.success(`User ${action}ed`)
      dispatch(baseApi.util.invalidateTags(['User']))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  if (isLoading) return <RowSkeletonList count={8} />

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-mist uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">User</th><th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((u) => (
              <tr key={u._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                    <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted">{u.handle}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge variant={u.role === 'listener' ? 'neutral' : 'current'} className="capitalize">{u.role}</Badge></td>
                <td className="px-5 py-3">{u.isBlocked ? <Badge variant="live">Blocked</Badge> : <Badge variant="success">Active</Badge>}</td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => act(u._id, u.isBlocked ? 'unblock' : 'block')}>
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} className="py-4" />}
    </div>
  )
}
