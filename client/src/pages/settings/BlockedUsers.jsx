import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { UserX, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import apiClient from '@/services/apiClient'
import { useUnblockUserSelfMutation } from '@/services/user.api'

export default function BlockedUsers() {
  const user = useSelector((s) => s.auth.user)
  const blockedIds = useMemo(() => user?.blockedUsers || [], [user])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [unblockUserSelf] = useUnblockUserSelfMutation()

  useEffect(() => {
    if (!blockedIds.length) { setLoading(false); return }
    setLoading(true)
    Promise.all(blockedIds.map((id) => apiClient.get(`/users/${id}`).then((r) => r.data.data).catch(() => null)))
      .then((users) => setBlockedUsers(users.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [blockedIds])

  const handleUnblock = async (id) => {
    try {
      await unblockUserSelf(id).unwrap()
      setBlockedUsers((prev) => prev.filter((u) => u._id !== id))
      toast.success('Unblocked')
    } catch (err) {
      toast.error(err.message || 'Could not unblock')
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={22} /></div>

  return blockedUsers.length ? (
    <div className="card p-4 max-w-lg divide-y divide-white/[0.06]">
      {blockedUsers.map((u) => (
        <div key={u._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <Avatar name={u.name} src={u.avatarUrl} size="sm" />
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{u.name}</p><p className="text-xs text-muted truncate">{u.handle}</p></div>
          <Button size="sm" variant="ghost" onClick={() => handleUnblock(u._id)}>Unblock</Button>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState icon={UserX} title="No blocked users" description="Users you block will show up here." />
  )
}
