import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Users, Share2, MessageSquare, UserPlus, Gift, Loader2, Plus } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import EqBars from '@/components/ui/EqBars'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import QueueItem from '@/components/room/QueueItem'
import ChatPanel from '@/components/room/ChatPanel'
import AddToQueueModal from '@/components/room/AddToQueueModal'
import { useGetRoomQuery, useGetQueueQuery, useGetMessagesQuery } from '@/services/room.api'
import { useSendTipMutation } from '@/services/wallet.api'
import { useSocket } from '@/app/SocketProvider'
import { setActiveRoom, syncFromRoom, playTrack } from '@/store/slices/playerSlice'

export default function RoomDetails() {
  const { roomId } = useParams()
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.user)
  const { emit, on, connected } = useSocket()

  const { data: room, isLoading: roomLoading } = useGetRoomQuery(roomId)
  const { data: initialQueue } = useGetQueueQuery(roomId, { skip: !roomId })
  const { data: initialMessages } = useGetMessagesQuery({ roomId }, { skip: !roomId })

  const [tab, setTab] = useState('queue')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState(50)
  const [tipNote, setTipNote] = useState('')
  const [sendTip, { isLoading: sendingTip }] = useSendTipMutation()

  const [queue, setQueue] = useState([])
  const [messages, setMessages] = useState([])
  const [presenceCount, setPresenceCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => { if (initialQueue) setQueue(initialQueue) }, [initialQueue])
  useEffect(() => { if (initialMessages?.results) setMessages(initialMessages.results) }, [initialMessages])
  useEffect(() => { if (room?.listenerCount) setPresenceCount(room.listenerCount) }, [room])

  // Track whichever room is driving the shared player, so the mini-player
  // knows to stay in lockstep instead of letting the user scrub freely.
  useEffect(() => {
    if (room?.currentTrack) {
      dispatch(setActiveRoom(roomId))
      dispatch(playTrack(room.currentTrack))
    }
    return () => dispatch(setActiveRoom(null))
  }, [room?.currentTrack, roomId, dispatch])

  useEffect(() => {
    if (!connected || !roomId) return undefined

    emit('join-room', { roomId }, (res) => {
      if (!res?.ok) toast.error(res?.error || 'Could not join room')
    })

    const offJoined = on('user-joined', () => {})
    const offLeft = on('user-left', () => {})
    const offPresence = on('presence-count', ({ count }) => setPresenceCount(count))
    const offSync = on('music-synced', (payload) => dispatch(syncFromRoom(payload)))
    const offQueue = on('queue-updated', ({ entry, action }) => {
      setQueue((prev) => {
        if (action === 'added') return [...prev, entry].sort((a, b) => b.voteCount - a.voteCount)
        if (action === 'voted') return prev.map((q) => (q._id === entry._id ? entry : q)).sort((a, b) => b.voteCount - a.voteCount)
        return prev
      })
    })
    const offChat = on('chat:message', (message) => setMessages((prev) => [...prev, message]))
    const offTyping = on('chat:typing', ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        const withoutUser = prev.filter((u) => u.id !== user.id)
        return isTyping ? [...withoutUser, user] : withoutUser
      })
    })

    return () => {
      emit('leave-room', { roomId })
      offJoined(); offLeft(); offPresence(); offSync(); offQueue(); offChat(); offTyping()
    }
  }, [connected, roomId, emit, on, dispatch])

  const handleUpvote = useCallback((voteId) => {
    emit('vote-song', { roomId, voteId }, (res) => {
      if (!res?.ok) toast.error(res?.error || 'Could not vote')
    })
  }, [emit, roomId])

  const handleSendMessage = useCallback((text) => {
    emit('chat:message', { roomId, text }, (res) => {
      if (!res?.ok) toast.error(res?.error || 'Message failed to send')
    })
  }, [emit, roomId])

  const handleTyping = useCallback((isTyping) => {
    emit('chat:typing', { roomId, isTyping })
  }, [emit, roomId])

  const hasVoted = useMemo(() => {
    const map = {}
    queue.forEach((q) => { map[q._id] = q.voters?.includes(currentUser?._id) })
    return map
  }, [queue, currentUser])

  const submitTip = async (e) => {
    e.preventDefault()
    try {
      await sendTip({ toUserId: room.host._id, amount: Number(tipAmount), note: tipNote, roomId }).unwrap()
      toast.success(`Tipped ${room.host.name} ₹${tipAmount}!`)
      setTipOpen(false)
      setTipNote('')
    } catch (err) {
      toast.error(err.message || 'Tip failed')
    }
  }

  if (roomLoading || !room) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-current-2" size={28} /></div>
  }

  const currentTrack = room.currentTrack

  return (
    <div>
      <div
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8 mb-6 bg-cover bg-center"
        style={{ background: room.coverUrl ? `url(${room.coverUrl}) center/cover` : 'linear-gradient(150deg,#7C5CFF,#0D0B14)' }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            {room.isLive && <Badge variant="live" dot className="mb-3 bg-black/30 border-white/20">Live</Badge>}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">{room.name}</h1>
            <p className="text-white/80 text-sm">Hosted by {room.host?.name} · {room.genre}{room.mood ? ` · ${room.mood}` : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-white text-sm font-mono">
              <Users size={14} /> {presenceCount}
            </div>
            {currentUser?._id !== room.host?._id && (
              <Button variant="ghost" size="sm" className="bg-black/30 border-white/20 text-white" onClick={() => setTipOpen(true)}>
                <Gift size={14} /> Tip host
              </Button>
            )}
            <Button variant="ghost" size="sm" className="bg-black/30 border-white/20 text-white" onClick={() => setInviteOpen(true)}>
              <UserPlus size={14} /> Invite
            </Button>
            <Button
              variant="ghost" size="icon" className="bg-black/30 border-white/20 text-white"
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Room link copied') }}
            >
              <Share2 size={15} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          {currentTrack && (
            <div className="card p-6 mb-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl shrink-0 bg-cover bg-center" style={{ background: currentTrack.coverUrl ? `url(${currentTrack.coverUrl}) center/cover` : 'linear-gradient(160deg,#7C5CFF,#0D0B14)' }} />
              <div className="min-w-0 flex-1">
                <p className="heading-eyebrow mb-1">Now playing</p>
                <p className="font-display text-xl font-semibold truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted truncate">{currentTrack.artist?.name}</p>
              </div>
              <EqBars size="lg" className="hidden sm:flex" />
            </div>
          )}

          <Tabs
            className="mb-5"
            tabs={[
              { label: 'Queue', value: 'queue' }, { label: 'Participants', value: 'people' },
              { label: 'Chat', value: 'chat' },
            ]}
            active={tab} onChange={setTab}
          />

          {tab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted font-medium">{queue.length} song{queue.length !== 1 ? 's' : ''} in queue</p>
                <button
                  onClick={() => setQueueOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-current/15 hover:bg-current/25 text-current-2 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  <Plus size={12} />Add track
                </button>
              </div>
              {queue.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted">Queue is empty — be the first to add a track.</p>
                  <button
                    onClick={() => setQueueOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-current text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus size={14} />Add the first track
                  </button>
                </div>
              )}
              <div className="space-y-1">
                {queue.map((entry, i) => (
                  <QueueItem key={entry._id} entry={entry} rank={i + 1} onUpvote={handleUpvote} hasVoted={hasVoted[entry._id]} />
                ))}
              </div>
            </div>
          )}

          {tab === 'people' && (
            <div className="card p-4 flex items-center gap-3">
              <Users size={16} className="text-current-2" />
              <p className="text-sm text-muted">{presenceCount} listener{presenceCount === 1 ? '' : 's'} currently in this room.</p>
            </div>
          )}

          {tab === 'chat' && (
            <div className="card p-5 h-[420px] lg:hidden">
              <ChatPanel messages={messages} onSend={handleSendMessage} onTyping={handleTyping} typingUsers={typingUsers} />
            </div>
          )}
        </div>

        <div className="card p-5 h-fit hidden lg:block sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-current-2" />
            <h3 className="font-display font-semibold">Room chat</h3>
          </div>
          <div className="h-[520px]">
            <ChatPanel messages={messages} onSend={handleSendMessage} onTyping={handleTyping} typingUsers={typingUsers} />
          </div>
        </div>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite friends">
        <p className="text-sm text-muted mb-4">Share this room link — anyone with it can join instantly.</p>
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5">
          <span className="text-sm font-mono text-mist truncate flex-1">{window.location.href}</span>
          <Button size="sm" variant="subtle" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Copied') }}>Copy</Button>
        </div>
      </Modal>

      <Modal open={tipOpen} onClose={() => setTipOpen(false)} title={`Tip ${room.host?.name}`}>
        <form onSubmit={submitTip} className="space-y-4">
          <div className="flex gap-2">
            {[50, 100, 250].map((amt) => (
              <button
                type="button" key={amt} onClick={() => setTipAmount(amt)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${tipAmount === amt ? 'border-current bg-current/10 text-current-2' : 'border-white/10 text-mist'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <Input label="Custom amount" type="number" min={1} value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} />
          <Input label="Note (optional)" placeholder="Great set!" value={tipNote} onChange={(e) => setTipNote(e.target.value)} />
          <Button type="submit" className="w-full" disabled={sendingTip}>{sendingTip ? 'Sending…' : `Send ₹${tipAmount} tip`}</Button>
        </form>
      </Modal>
      {queueOpen && <AddToQueueModal roomId={roomId} onClose={() => setQueueOpen(false)} />}
    </div>
  )
}
