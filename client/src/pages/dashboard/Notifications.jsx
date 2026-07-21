import { Bell, Vote, UserPlus, Radio, Wallet, ListMusic, Settings, Loader2, MessageSquare } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { useListNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation, useDeleteNotificationMutation } from '@/services/notification.api'
import { cn } from '@/utils/cn'

const icons = { vote: Vote, follow: UserPlus, room: Radio, tip: Wallet, playlist: ListMusic, system: Settings, friend_request: UserPlus, message: MessageSquare }

export default function Notifications() {
  const { data, isLoading } = useListNotificationsQuery({ limit: 30 })
  const [markRead] = useMarkReadMutation()
  const [markAllRead] = useMarkAllReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={24} /></div>

  const notifications = data?.results || []

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="heading-eyebrow mb-1">Notifications</p>
          <h1 className="font-display text-3xl font-bold">Stay in the loop</h1>
        </div>
        {data?.unreadCount > 0 && <Button size="sm" variant="ghost" onClick={() => markAllRead()}>Mark all read</Button>}
      </div>
      {notifications.length ? (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Bell
            return (
              <div key={n._id} className={cn('flex items-start gap-4 card p-4 cursor-pointer', n.isRead === false && 'border-current/30')} onClick={() => !n.isRead && markRead(n._id)}>
                <div className="w-9 h-9 rounded-xl bg-current/15 flex items-center justify-center shrink-0"><Icon size={16} className="text-current-2" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted mt-0.5 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-ember mt-2 shrink-0" />}
                <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id) }} className="text-mist hover:text-ember-2 text-xs shrink-0">✕</button>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
      )}
    </div>
  )
}
