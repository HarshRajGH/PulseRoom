const BaseRepository = require('./BaseRepository')
const { Notification } = require('../models')

class NotificationRepository extends BaseRepository {
  constructor() { super(Notification) }

  markAllRead(userId) {
    return this.model.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } })
  }

  unreadCount(userId) {
    return this.model.countDocuments({ user: userId, isRead: false })
  }
}

module.exports = new NotificationRepository()
