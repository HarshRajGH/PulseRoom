import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { UserPlus, Check, X, Users, Loader2 } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import ConversationList from '@/components/messages/ConversationList'
import DmThread from '@/components/messages/DmThread'
import NewMessageModal from '@/components/messages/NewMessageModal'
import {
  useListConversationsQuery, useStartConversationMutation, useGetDirectMessagesQuery,
  useSendDirectMessageMutation, useUploadDmAttachmentMutation, useMarkThreadReadMutation, useDeleteConversationMutation,
} from '@/services/conversation.api'
import {
  useListIncomingRequestsQuery, useListFriendsQuery,
  useAcceptRequestMutation, useRejectRequestMutation,
} from '@/services/friend.api'
import { useSocket } from '@/app/SocketProvider'
import { baseApi } from '@/services/baseApi'

export default function Messages() {
  const [tab, setTab] = useState('messages')
  const currentUserId = useSelector((s) => s.auth.user?._id)
  const dispatch = useDispatch()
  const { emit, on, connected } = useSocket()

  const { data: conversationsData, isLoading: conversationsLoading } = useListConversationsQuery({ limit: 30 })
  const [startConversation] = useStartConversationMutation()
  const [deleteConversation] = useDeleteConversationMutation()
  const [sendMessage] = useSendDirectMessageMutation()
  const [uploadAttachment, { isLoading: uploading }] = useUploadDmAttachmentMutation()
  const [markThreadRead] = useMarkThreadReadMutation()

  const [activeConversation, setActiveConversation] = useState(null)
  const [search, setSearch] = useState('')
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [onlineIds, setOnlineIds] = useState(new Set())

  const { data: threadData, isFetching: threadLoading } = useGetDirectMessagesQuery(
    activeConversation ? { id: activeConversation._id, page, limit: 30 } : undefined,
    { skip: !activeConversation },
  )

  useEffect(() => {
    if (!threadData) return
    setMessages((prev) => (page === 1 ? threadData.results : [...threadData.results, ...prev]))
  }, [threadData, page])

  useEffect(() => { setPage(1); setMessages([]) }, [activeConversation?._id])

  const conversations = useMemo(() => {
    const list = conversationsData?.results || []
    return list.filter((c) => {
      if (!search.trim()) return true
      const other = c.participants.find((p) => p._id !== currentUserId)
      return other?.name?.toLowerCase().includes(search.toLowerCase())
    }).map((c) => ({
      ...c,
      unread: c.lastMessage && c.lastMessage.status !== 'read' && (c.lastMessage.recipient === currentUserId || c.lastMessage.recipient?._id === currentUserId),
    }))
  }, [conversationsData, search, currentUserId])

  // Query online status for everyone in the conversation list whenever it changes.
  useEffect(() => {
    if (!connected || !conversations.length) return
    const otherIds = conversations.map((c) => c.participants.find((p) => p._id !== currentUserId)?._id).filter(Boolean)
    emit('presence:query', { userIds: otherIds }, (statuses) => {
      setOnlineIds(new Set(Object.entries(statuses || {}).filter(([, v]) => v).map(([id]) => id)))
    })
  }, [connected, conversations, currentUserId, emit])

  useEffect(() => {
    if (!connected) return undefined
    const offMsg = on('dm:message', ({ conversationId, message }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message])
        if ((message.recipient?._id || message.recipient) === currentUserId) {
          emit('dm:read', { conversationId })
        }
      }
      dispatch(baseApi.util.invalidateTags([{ type: 'Conversation', id: 'LIST' }]))
    })
    const offTyping = on('dm:typing', ({ conversationId, isTyping }) => {
      if (activeConversation?._id === conversationId) setTyping(isTyping)
    })
    const offRead = on('dm:read', ({ conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => prev.map((m) => ({ ...m, status: 'read' })))
      }
    })
    const offDelivered = on('dm:delivered', ({ conversationId, messageId, status }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status } : m)))
      }
    })
    const offOnline = on('presence:online', ({ userId }) => setOnlineIds((prev) => new Set(prev).add(userId)))
    const offOffline = on('presence:offline', ({ userId }) => setOnlineIds((prev) => { const next = new Set(prev); next.delete(userId); return next }))

    return () => { offMsg(); offTyping(); offRead(); offDelivered(); offOnline(); offOffline() }
  }, [connected, on, activeConversation, currentUserId, dispatch, emit])

  const selectConversation = useCallback((c) => {
    setActiveConversation(c)
    setTyping(false)
    if (c.unread) markThreadRead(c._id)
    emit('dm:read', { conversationId: c._id })
  }, [markThreadRead, emit])

  const handleSelectUser = async (userId) => {
    try {
      const conversation = await startConversation(userId).unwrap()
      setNewMessageOpen(false)
      selectConversation(conversation)
    } catch (err) {
      toast.error(err.message || 'Could not start conversation')
    }
  }

  const handleSend = ({ text, attachments }) => {
    emit('dm:message', { conversationId: activeConversation._id, text, attachments }, (res) => {
      if (!res?.ok) {
        toast.error(res?.error || 'Message failed — sending via backup channel')
        sendMessage({ id: activeConversation._id, text, attachments })
      }
    })
  }

  const handleTyping = (isTyping) => {
    if (activeConversation) emit('dm:typing', { conversationId: activeConversation._id, isTyping })
  }

  const handleUploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      return await uploadAttachment(formData).unwrap()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      return null
    }
  }

  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id).unwrap()
      if (activeConversation?._id === id) setActiveConversation(null)
      toast.success('Conversation removed')
    } catch (err) {
      toast.error(err.message || 'Could not remove conversation')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="heading-eyebrow mb-1">Messages</p>
          <h1 className="font-display text-3xl font-bold">Direct messages</h1>
        </div>
      </div>

      <Tabs className="mb-6" tabs={[{ label: 'Messages', value: 'messages' }, { label: 'Friend requests', value: 'requests' }]} active={tab} onChange={setTab} />

      {tab === 'messages' && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-5 h-[calc(100vh-14rem)]">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?._id}
            onSelect={selectConversation}
            onDelete={handleDeleteConversation}
            currentUserId={currentUserId}
            search={search}
            onSearchChange={setSearch}
            onlineIds={onlineIds}
            onNewMessage={() => setNewMessageOpen(true)}
          />
          {activeConversation ? (
            <DmThread
              conversation={activeConversation}
              messages={messages}
              currentUserId={currentUserId}
              onSend={handleSend}
              onTyping={handleTyping}
              onLoadMore={() => setPage((p) => p + 1)}
              hasMore={threadData?.pagination ? page < threadData.pagination.totalPages : false}
              loadingMore={threadLoading && page > 1}
              typing={typing}
              uploading={uploading}
              onUploadFile={handleUploadFile}
              isOnline={onlineIds.has(activeConversation.participants.find((p) => p._id !== currentUserId)?._id)}
            />
          ) : (
            <div className="card flex items-center justify-center">
              {conversationsLoading ? <Loader2 className="animate-spin text-current-2" size={22} /> : (
                <EmptyState title="Select a conversation" description="Pick someone from the list, or start a new message." />
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && <FriendRequestsPanel />}

      <NewMessageModal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} onSelectUser={handleSelectUser} currentUserId={currentUserId} />
    </div>
  )
}

function FriendRequestsPanel() {
  const { data: requests } = useListIncomingRequestsQuery()
  const { data: friends } = useListFriendsQuery()
  const [acceptRequest] = useAcceptRequestMutation()
  const [rejectRequest] = useRejectRequestMutation()

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Pending requests</h2>
        {requests?.length ? (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="card p-4 flex items-center gap-3">
                <Avatar name={r.from?.name} src={r.from?.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{r.from?.name}</p><p className="text-xs text-muted truncate">{r.from?.handle}</p></div>
                <button onClick={() => acceptRequest(r._id).then(() => toast.success('Friend added'))} className="text-current-2"><Check size={16} /></button>
                <button onClick={() => rejectRequest(r._id)} className="text-mist hover:text-ember-2"><X size={16} /></button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={UserPlus} title="No pending requests" description="Friend requests you receive will show up here." />}
      </section>
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Friends</h2>
        {friends?.length ? (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f._id} className="card p-4 flex items-center gap-3">
                <Avatar name={f.name} src={f.avatarUrl} size="sm" />
                <div className="min-w-0"><p className="text-sm font-medium truncate">{f.name}</p><p className="text-xs text-muted truncate">{f.handle}</p></div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Users} title="No friends yet" description="Accept requests to connect with people." />}
      </section>
    </div>
  )
}
