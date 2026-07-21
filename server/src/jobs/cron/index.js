const cron = require('node-cron')
const logger = require('../../config/logger')
const { Session, Room, Subscription } = require('../../models')

// Daily 2 AM — purge expired/revoked sessions that Mongo's TTL index hasn't
// swept yet, and auto-expire subscriptions past their renewal date.
function registerCronJobs() {
  cron.schedule('0 2 * * *', async () => {
    try {
      const sessionResult = await Session.deleteMany({ expiresAt: { $lt: new Date() } })
      const subResult = await Subscription.updateMany(
        { isActive: true, renewsAt: { $lt: new Date() } },
        { $set: { isActive: false, cancelledAt: new Date() } },
      )
      logger.info(`[cron] cleanup → sessions removed: ${sessionResult.deletedCount}, subscriptions expired: ${subResult.modifiedCount}`)
    } catch (err) {
      logger.error(`[cron] cleanup job failed: ${err.message}`)
    }
  })

  // Every 10 minutes — close rooms nobody is listening to anymore.
  cron.schedule('*/10 * * * *', async () => {
    try {
      const result = await Room.updateMany(
        { isLive: true, listenerCount: 0, updatedAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } },
        { $set: { isLive: false, endedAt: new Date() } },
      )
      if (result.modifiedCount) logger.info(`[cron] auto-closed ${result.modifiedCount} idle room(s)`)
    } catch (err) {
      logger.error(`[cron] room-cleanup job failed: ${err.message}`)
    }
  })

  logger.info('Cron jobs registered (session cleanup, idle-room cleanup)')
}

module.exports = registerCronJobs
