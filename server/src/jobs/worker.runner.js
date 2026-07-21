// Standalone process for BullMQ workers — run with `npm run worker`
// alongside the main API process (they share Redis + MongoDB).
require('dotenv').config()
const connectDB = require('../config/db')
const logger = require('../config/logger')
const startEmailWorker = require('./workers/email.worker')
const startAnalyticsWorker = require('./workers/analytics.worker')

;(async () => {
  await connectDB()
  startEmailWorker()
  startAnalyticsWorker()
  logger.info('BullMQ workers started (email, analytics-rollup)')
})()
