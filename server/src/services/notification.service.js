const notificationRepository = require('../repositories/notification.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function createNotification(userId, type, text, meta = {}) {
  return notificationRepository.create({ user: userId, type, text, meta })
}

async function listForUser(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total, unread] = await Promise.all([
    notificationRepository.find({ user: userId }, { skip, limit }),
    notificationRepository.count({ user: userId }),
    notificationRepository.unreadCount(userId),
  ])
  return { ...buildPaginatedResponse(items, total, page, limit), unreadCount: unread }
}

async function markRead(id, userId) {
  return notificationRepository.model.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true })
}

async function markAllRead(userId) {
  await notificationRepository.markAllRead(userId)
}

async function remove(id, userId) {
  await notificationRepository.model.findOneAndDelete({ _id: id, user: userId })
}

module.exports = { createNotification, listForUser, markRead, markAllRead, remove }
