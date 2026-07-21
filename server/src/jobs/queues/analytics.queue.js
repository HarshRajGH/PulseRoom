const { Queue } = require('bullmq')
const { connection } = require('./queue.connection')

const analyticsQueue = new Queue('analytics-rollup', { connection })

async function enqueueAnalyticsEvent(job) {
  return analyticsQueue.add('rollup-event', job, {
    attempts: 3,
    removeOnComplete: 500,
    removeOnFail: 500,
  })
}

module.exports = { analyticsQueue, enqueueAnalyticsEvent }
