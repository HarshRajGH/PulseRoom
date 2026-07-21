const BaseRepository = require('./BaseRepository')
const { DirectMessage } = require('../models')

class DirectMessageRepository extends BaseRepository {
  constructor() { super(DirectMessage) }

  getThread(conversationId, userId, { skip = 0, limit = 30 } = {}) {
    return this.model
      .find({ conversation: conversationId, isDeleted: false })
      .sort('-createdAt').skip(skip).limit(limit)
      .populate('sender', 'name handle avatarUrl')
      .populate('recipient', 'name handle avatarUrl')
  }

  countInThread(conversationId) {
    return this.model.countDocuments({ conversation: conversationId, isDeleted: false })
  }

  searchInThread(conversationId, term, { skip = 0, limit = 30 } = {}) {
    return this.model
      .find({ conversation: conversationId, isDeleted: false, $text: { $search: term } })
      .skip(skip).limit(limit)
      .populate('sender', 'name handle avatarUrl')
  }

  unreadCountForUser(userId) {
    return this.model.countDocuments({ recipient: userId, status: { $ne: 'read' }, isDeleted: false })
  }

  markThreadRead(conversationId, readerId) {
    return this.model.updateMany(
      { conversation: conversationId, recipient: readerId, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } },
    )
  }

  markDelivered(id) {
    return this.model.findByIdAndUpdate(id, { $set: { status: 'delivered', deliveredAt: new Date() } }, { new: true })
  }
}

module.exports = new DirectMessageRepository()
