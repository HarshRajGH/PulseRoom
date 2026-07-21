require('dotenv').config()
const http = require('http')
const app = require('./app')
const env = require('./config/env')
const logger = require('./config/logger')
const connectDB = require('./config/db')
const { connectRedis } = require('./config/redis')
const initSockets = require('./sockets')
const registerCronJobs = require('./jobs/cron')

async function bootstrap() {
  await connectDB()
  await connectRedis()

  const httpServer = http.createServer(app)
  initSockets(httpServer)
  registerCronJobs()

  httpServer.listen(env.port, () => {
    logger.info(`SyncWave API listening on port ${env.port} [${env.nodeEnv}]`)
    logger.info(`Swagger docs → http://localhost:${env.port}/api-docs`)
  })

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack : reason}`)
  })
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.stack}`)
    process.exit(1)
  })
}

bootstrap()
