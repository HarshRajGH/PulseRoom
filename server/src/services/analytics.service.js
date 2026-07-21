const analyticsRepository = require('../repositories/analytics.repository')
const { enqueueAnalyticsEvent } = require('../jobs/queues/analytics.queue')
const { User, Room, Transaction } = require('../models')

function dateNDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

async function recordEvent(scope, refId, increments) {
  return enqueueAnalyticsEvent({ scope, refId: refId ? refId.toString() : null, increments })
}

async function getUserAnalytics(userId, days = 7) {
  return analyticsRepository.rangeFor('user', userId, dateNDaysAgo(days), dateNDaysAgo(0))
}

async function getRoomAnalytics(roomId, days = 7) {
  return analyticsRepository.rangeFor('room', roomId, dateNDaysAgo(days), dateNDaysAgo(0))
}

async function getPlatformOverview() {
  const [totalUsers, activeRooms, revenueAgg] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Room.countDocuments({ isLive: true }),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(1)) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])
  return {
    totalUsers,
    activeRooms,
    revenueMTD: revenueAgg[0]?.total || 0,
  }
}

module.exports = { recordEvent, getUserAnalytics, getRoomAnalytics, getPlatformOverview }
