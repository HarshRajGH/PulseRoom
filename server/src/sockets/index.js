const { Server } = require('socket.io')
const env = require('../config/env')
const logger = require('../config/logger')
const socketAuthMiddleware = require('./socket.auth')
const presenceStore = require('./presence.store')
const userPresenceStore = require('./userPresence.store')

const roomService = require('../services/room.service')
const queueService = require('../services/queue.service')
const messageService = require('../services/message.service')
const analyticsService = require('../services/analytics.service')
const conversationService = require('../services/conversation.service')
const directMessageService = require('../services/directMessage.service')
const directMessageRepository = require('../repositories/directMessage.repository')
const userRepository = require('../repositories/user.repository')

const ROOM_CHANNEL = (roomId) => `room:${roomId}`
const USER_CHANNEL = (userId) => `user:${userId}`

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  })

  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    logger.info(`[socket] connected: ${socket.user.name} (${socket.id})`)
    let currentRoomId = null

    const userSummary = () => ({
      id: socket.user._id, name: socket.user.name, avatarUrl: socket.user.avatarUrl,
    })

    // Every authenticated connection joins a personal room — this is how
    // DMs, notifications, and presence updates get pushed to a user
    // regardless of which page/room they're currently viewing.
    socket.join(USER_CHANNEL(socket.user._id))

    // First connection for this user (they might have multiple tabs/devices
    // open) flips them online and tells their friends.
    userPresenceStore.registerConnection(socket.user._id).then(async (justCameOnline) => {
      if (!justCameOnline) return
      const me = await userRepository.findById(socket.user._id)
      me?.following?.forEach((friendId) => {
        io.to(USER_CHANNEL(friendId)).emit('presence:online', { userId: socket.user._id.toString() })
      })
    })

    // --- join-room ---
    socket.on('join-room', async ({ roomId }, ack) => {
      try {
        // MUST join synchronously to prevent React StrictMode race conditions!
        socket.join(ROOM_CHANNEL(roomId))
        currentRoomId = roomId

        const room = await roomService.joinRoom(roomId, socket.user._id)
        await presenceStore.markPresent(roomId, socket.user._id, userSummary())

        socket.to(ROOM_CHANNEL(roomId)).emit('user-joined', { user: userSummary() })
        io.to(ROOM_CHANNEL(roomId)).emit('presence-count', { count: await presenceStore.listPresent(roomId) })

        ack?.({ ok: true, room })
      } catch (err) {
        socket.leave(ROOM_CHANNEL(roomId)) // Revert if failed
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- leave-room ---
    socket.on('leave-room', async ({ roomId } = {}) => {
      const targetRoom = roomId || currentRoomId
      if (!targetRoom) return

      // MUST leave synchronously
      socket.leave(ROOM_CHANNEL(targetRoom))
      if (targetRoom === currentRoomId) currentRoomId = null

      await roomService.leaveRoom(targetRoom, socket.user._id).catch(() => {})
      await presenceStore.markAbsent(targetRoom, socket.user._id)
      
      socket.to(ROOM_CHANNEL(targetRoom)).emit('user-left', { userId: socket.user._id })
      io.to(ROOM_CHANNEL(targetRoom)).emit('presence-count', { count: await presenceStore.listPresent(targetRoom) })
    })

    // --- sync-music: host broadcasts authoritative playback position ---
    socket.on('sync-music', ({ roomId, trackId, positionSeconds, isPlaying }) => {
      if (!roomId) return
      socket.to(ROOM_CHANNEL(roomId)).emit('music-synced', {
        trackId, positionSeconds, isPlaying, syncedAt: Date.now(),
      })
    })

    // --- queue-song ---
    socket.on('queue-song', async ({ roomId, songId }, ack) => {
      try {
        const entry = await queueService.addToQueue(roomId, socket.user._id, songId)
        io.to(ROOM_CHANNEL(roomId)).emit('queue-updated', { action: 'added', entry })
        ack?.({ ok: true, entry })
      } catch (err) {
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- vote-song ---
    socket.on('vote-song', async ({ roomId, voteId }, ack) => {
      try {
        const entry = await queueService.upvote(voteId, socket.user._id)
        io.to(ROOM_CHANNEL(roomId)).emit('queue-updated', { action: 'voted', entry })
        analyticsService.recordEvent('room', roomId, { votes: 1 }).catch(() => {})
        ack?.({ ok: true, entry })
      } catch (err) {
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- chat: message ---
    socket.on('chat:message', async ({ roomId, text }, ack) => {
      try {
        const message = await messageService.postMessage(roomId, socket.user._id, text)
        io.to(ROOM_CHANNEL(roomId)).emit('chat:message', {
          _id: message._id, text: message.text, createdAt: message.createdAt,
          sender: userSummary(),
        })
        analyticsService.recordEvent('room', roomId, { messages: 1 }).catch(() => {})
        ack?.({ ok: true })
      } catch (err) {
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- chat: typing indicator ---
    socket.on('chat:typing', ({ roomId, isTyping }) => {
      if (!roomId) return
      socket.to(ROOM_CHANNEL(roomId)).emit('chat:typing', { user: userSummary(), isTyping })
    })

    // --- presence heartbeat (client pings every ~30s to stay "present") ---
    socket.on('heartbeat', async ({ roomId } = {}) => {
      const targetRoom = roomId || currentRoomId
      if (!targetRoom) return
      await presenceStore.heartbeat(targetRoom, socket.user._id)
    })

    // --- direct messages: send ---
    socket.on('dm:message', async ({ conversationId, text, attachments }, ack) => {
      try {
        const message = await directMessageService.sendMessage(conversationId, socket.user._id, { text, attachments })
        const recipientId = message.recipient._id?.toString() || message.recipient.toString()

        // Push to both participants' personal rooms — the sender gets it
        // too so any other open tab/device stays in sync.
        io.to(USER_CHANNEL(recipientId)).emit('dm:message', { conversationId, message })
        io.to(USER_CHANNEL(socket.user._id)).emit('dm:message', { conversationId, message })

        // If the recipient is online right now, immediately mark delivered
        // and let the sender know.
        const recipientOnline = await userPresenceStore.isOnline(recipientId)
        if (recipientOnline) {
          const delivered = await directMessageRepository.markDelivered(message._id)
          io.to(USER_CHANNEL(socket.user._id)).emit('dm:delivered', { conversationId, messageId: message._id, status: delivered.status })
        }

        ack?.({ ok: true, message })
      } catch (err) {
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- direct messages: typing indicator ---
    socket.on('dm:typing', async ({ conversationId, isTyping }) => {
      try {
        const conversation = await conversationService.getConversation(conversationId, socket.user._id)
        const otherId = conversation.participants.find((p) => p._id.toString() !== socket.user._id.toString())?._id
        if (otherId) io.to(USER_CHANNEL(otherId)).emit('dm:typing', { conversationId, user: userSummary(), isTyping })
      } catch {
        // conversation not found / no access — silently ignore, this is a
        // best-effort UI signal, not a critical action.
      }
    })

    // --- direct messages: read receipts ---
    socket.on('dm:read', async ({ conversationId }, ack) => {
      try {
        await directMessageService.markThreadRead(conversationId, socket.user._id)
        const conversation = await conversationService.getConversation(conversationId, socket.user._id)
        const otherId = conversation.participants.find((p) => p._id.toString() !== socket.user._id.toString())?._id
        if (otherId) io.to(USER_CHANNEL(otherId)).emit('dm:read', { conversationId, readBy: socket.user._id })
        ack?.({ ok: true })
      } catch (err) {
        ack?.({ ok: false, error: err.message })
      }
    })

    // --- presence: query online status for a list of user ids ---
    socket.on('presence:query', async ({ userIds = [] }, ack) => {
      const statuses = await userPresenceStore.onlineStatusFor(userIds)
      ack?.(statuses)
    })

    // --- disconnect ---
    socket.on('disconnect', async () => {
      logger.info(`[socket] disconnected: ${socket.user.name} (${socket.id})`)

      const wentOffline = await userPresenceStore.deregisterConnection(socket.user._id)
      if (wentOffline) {
        const me = await userRepository.findById(socket.user._id).catch(() => null)
        me?.following?.forEach((friendId) => {
          io.to(USER_CHANNEL(friendId)).emit('presence:offline', { userId: socket.user._id.toString() })
        })
      }

      if (!currentRoomId) return
      await roomService.leaveRoom(currentRoomId, socket.user._id).catch(() => {})
      await presenceStore.markAbsent(currentRoomId, socket.user._id)
      socket.to(ROOM_CHANNEL(currentRoomId)).emit('user-left', { userId: socket.user._id })
      const count = await presenceStore.listPresent(currentRoomId).catch(() => 0)
      io.to(ROOM_CHANNEL(currentRoomId)).emit('presence-count', { count })
    })
  })

  return io
}

module.exports = initSockets
