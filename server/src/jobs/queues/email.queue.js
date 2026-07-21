const { Queue } = require('bullmq')
const { connection } = require('./queue.connection')

const emailQueue = new Queue('email', { connection })

async function enqueueEmail(job) {
  return emailQueue.add('send-email', job, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  })
}

module.exports = { emailQueue, enqueueEmail }
