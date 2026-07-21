const { v4: uuid } = require('uuid')
const ApiError = require('../utils/ApiError')
const roomRepository = require('../repositories/room.repository')
const voteRepository = require('../repositories/vote.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { ROOM_PRIVACY } = require('../utils/constants')

async function listRooms(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = { privacy: ROOM_PRIVACY.PUBLIC }
  if (query.live === 'true') filter.isLive = true
  if (query.genre) filter.genre = query.genre
  if (query.q) filter.$text = { $search: query.q }

  const [items, total] = await Promise.all([
    roomRepository.find(filter, { skip, limit, populate: ['host'] }),
    roomRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function getRoom(id) {
  const room = await roomRepository.findById(id, ['host', 'currentTrack', 'participants'])
  if (!room) throw ApiError.notFound('Room not found')
  return room
}

async function createRoom(userId, data) {
  const payload = { ...data, host: userId, participants: [userId], listenerCount: 1 }
  if (data.privacy === ROOM_PRIVACY.PRIVATE) payload.inviteCode = uuid().slice(0, 8)
  return roomRepository.create(payload)
}

async function updateRoom(id, userId, data) {
  const room = await roomRepository.findById(id)
  if (!room) throw ApiError.notFound('Room not found')
  if (room.host.toString() !== userId.toString()) throw ApiError.forbidden('Only the host can update this room')
  Object.assign(room, data)
  await room.save()
  return room
}

async function endRoom(id, userId) {
  const room = await roomRepository.findById(id)
  if (!room) throw ApiError.notFound('Room not found')
  if (room.host.toString() !== userId.toString()) throw ApiError.forbidden('Only the host can end this room')
  room.isLive = false
  room.endedAt = new Date()
  await room.save()
  return room
}

async function joinRoom(id, userId) {
  const room = await roomRepository.findById(id)
  if (!room) throw ApiError.notFound('Room not found')
  if (room.bannedUsers.some((u) => u.toString() === userId.toString())) throw ApiError.forbidden('You are banned from this room')

  const alreadyIn = room.participants.some((p) => p.toString() === userId.toString())
  if (!alreadyIn) {
    room.participants.push(userId)
    room.listenerCount = room.participants.length
    await room.save()
  }
  return room
}

async function leaveRoom(id, userId) {
  const room = await roomRepository.findById(id)
  if (!room) throw ApiError.notFound('Room not found')
  room.participants = room.participants.filter((p) => p.toString() !== userId.toString())
  room.listenerCount = room.participants.length
  await room.save()
  return room
}

async function getQueue(roomId) {
  return voteRepository.getQueue(roomId)
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, endRoom, joinRoom, leaveRoom, getQueue }
