const { redisClient } = require('../config/redis')

const PRESENCE_TTL_SECONDS = 90 // must receive a heartbeat within this window

const roomKey = (roomId) => `presence:room:${roomId}`
const userKey = (roomId, userId) => `presence:room:${roomId}:user:${userId}`

async function markPresent(roomId, userId, userSummary) {
  await redisClient.sadd(roomKey(roomId), userId.toString())
  await redisClient.set(userKey(roomId, userId), JSON.stringify(userSummary), 'EX', PRESENCE_TTL_SECONDS)
}

async function heartbeat(roomId, userId) {
  await redisClient.expire(userKey(roomId, userId), PRESENCE_TTL_SECONDS)
}

async function markAbsent(roomId, userId) {
  await redisClient.srem(roomKey(roomId), userId.toString())
  await redisClient.del(userKey(roomId, userId))
}

async function listPresent(roomId) {
  const ids = await redisClient.smembers(roomKey(roomId))
  return ids.length
}

module.exports = { markPresent, heartbeat, markAbsent, listPresent }
