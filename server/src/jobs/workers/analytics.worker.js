const { Worker } = require('bullmq')
const { connection } = require('../queues/queue.connection')
const analyticsRepository = require('../../repositories/analytics.repository')
const logger = require('../../config/logger')

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function startAnalyticsWorker() {
  const worker = new Worker(
    'analytics-rollup',
    async (job) => {
      const { scope, refId, increments } = job.data
      await analyticsRepository.upsertDaily(scope, refId || null, todayKey(), increments)
    },
    { connection, concurrency: 10 },
  )

  worker.on('failed', (job, err) => logger.error(`[analytics.worker] failed: ${err.message}`))

  return worker
}

module.exports = startAnalyticsWorker
