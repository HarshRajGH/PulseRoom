const ApiError = require('../utils/ApiError')
const voteRepository = require('../repositories/vote.repository')
const roomRepository = require('../repositories/room.repository')

async function addToQueue(roomId, userId, songId) {
  const room = await roomRepository.findById(roomId)
  if (!room) throw ApiError.notFound('Room not found')

  const existing = await voteRepository.findOne({ room: roomId, song: songId, played: false })
  if (existing) throw ApiError.conflict('This track is already in the queue')

  return voteRepository.create({ room: roomId, song: songId, addedBy: userId, voters: [userId], voteCount: 1 })
}

async function upvote(voteId, userId) {
  const vote = await voteRepository.findById(voteId)
  if (!vote) throw ApiError.notFound('Queue entry not found')
  if (vote.voters.some((v) => v.toString() === userId.toString())) {
    throw ApiError.conflict('You already voted for this track')
  }
  vote.voters.push(userId)
  vote.voteCount += 1
  await vote.save()
  return vote
}

async function removeFromQueue(voteId, userId, isHostOrAdmin) {
  const vote = await voteRepository.findById(voteId)
  if (!vote) throw ApiError.notFound('Queue entry not found')
  if (!isHostOrAdmin && vote.addedBy.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the person who queued this track (or the host) can remove it')
  }
  await voteRepository.deleteById(voteId)
}

async function markPlayedAndAdvance(roomId) {
  const queue = await voteRepository.getQueue(roomId)
  if (!queue.length) return null

  const next = queue[0]
  next.played = true
  next.playedAt = new Date()
  await next.save()

  await roomRepository.updateById(roomId, {
    currentTrack: next.song._id || next.song,
    currentTrackStartedAt: new Date(),
  })

  return queue[1] || null
}

module.exports = { addToQueue, upvote, removeFromQueue, markPlayedAndAdvance }
