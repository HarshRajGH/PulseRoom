const { redisConfig } = require('../../config/redis')

// BullMQ requires its own ioredis-compatible connection options object
// (separate from the app's shared redisClient instance).
module.exports = { connection: redisConfig }
