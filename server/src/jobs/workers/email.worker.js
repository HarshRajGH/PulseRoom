const { Worker } = require('bullmq')
const { connection } = require('../queues/queue.connection')
const { sendMail } = require('../../config/mailer')
const logger = require('../../config/logger')

function startEmailWorker() {
  const worker = new Worker(
    'email',
    async (job) => {
      const { to, subject, html, text } = job.data
      await sendMail({ to, subject, html, text })
    },
    { connection, concurrency: 5 },
  )

  worker.on('completed', (job) => logger.info(`[email.worker] sent → ${job.data.to} (${job.data.subject})`))
  worker.on('failed', (job, err) => logger.error(`[email.worker] failed → ${job?.data?.to}: ${err.message}`))

  return worker
}

module.exports = startEmailWorker
