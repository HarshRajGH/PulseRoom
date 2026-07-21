const { redisClient } = require('../config/redis')

// Global "is this user online anywhere" presence — separate from
// presence.store.js, which tracks per-room listener sets. A user can have
// multiple open tabs/devices, so we keep a connection-count hash and only
// flip to "offline" when the count reaches zero.
const ONLINE_SET = 'presence:online-users'
const connKey = (userId) => `presence:conn-count:${userId}`

async function registerConnection(userId) {
  const count = await redisClient.incr(connKey(userId))
  if (count === 1) await redisClient.sadd(ONLINE_SET, userId.toString())
  return count === 1 // true if this was the user's first active connection
}

async function deregisterConnection(userId) {
  const count = await redisClient.decr(connKey(userId))
  if (count <= 0) {
    await redisClient.del(connKey(userId))
    await redisClient.srem(ONLINE_SET, userId.toString())
    return true // true if the user is now fully offline
  }
  return false
}

async function isOnline(userId) {
  return Boolean(await redisClient.sismember(ONLINE_SET, userId.toString()))
}

async function onlineStatusFor(userIds) {
  const results = await Promise.all(userIds.map((id) => redisClient.sismember(ONLINE_SET, id.toString())))
  return userIds.reduce((acc, id, i) => ({ ...acc, [id]: Boolean(results[i]) }), {})
}

module.exports = { registerConnection, deregisterConnection, isOnline, onlineStatusFor }
