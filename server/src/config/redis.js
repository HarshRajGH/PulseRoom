const Redis = require('ioredis')
const env = require('./env')
const logger = require('./logger')

const redisConfig = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: null,
  lazyConnect: true,
}

if (env.redis.host && !env.redis.host.includes('localhost') && !env.redis.host.includes('127.0.0.1')) {
  redisConfig.tls = {}
}

const redisClient = new Redis(redisConfig)

redisClient.on('connect', () => logger.info(`Redis connected → ${env.redis.host}:${env.redis.port}`))
redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`))

async function connectRedis() {
  try {
    await redisClient.connect()
  } catch (err) {
    logger.error(`Redis connection failed: ${err.message}`)
  }
}

module.exports = { redisClient, redisConfig, connectRedis }
