const BaseRepository = require('./BaseRepository')
const { Conversation } = require('../models')

class ConversationRepository extends BaseRepository {
  constructor() { super(Conversation) }

  findBetween(userA, userB) {
    return this.model.findOne({ participants: { $all: [userA, userB], $size: 2 } })
  }

  findByIdPopulated(id) {
    return this.model.findById(id).populate('participants', 'name handle avatarUrl').populate('lastMessage')
  }

  // A conversation a user soft-deleted stays hidden until a new message
  // arrives — directMessage.service clears the matching deletedFor entry
  // whenever a message is sent, so this stays a simple membership check.
  listForUser(userId, { skip = 0, limit = 20 } = {}) {
    return this.model
      .find({ participants: userId, 'deletedFor.user': { $ne: userId } })
      .sort('-lastMessageAt')
      .skip(skip).limit(limit)
      .populate('participants', 'name handle avatarUrl')
      .populate('lastMessage')
  }

  countForUser(userId) {
    return this.model.countDocuments({ participants: userId, 'deletedFor.user': { $ne: userId } })
  }

  clearDeletedFor(conversationId, userId) {
    return this.model.findByIdAndUpdate(conversationId, { $pull: { deletedFor: { user: userId } } })
  }

  softDeleteFor(conversationId, userId) {
    return this.model.findByIdAndUpdate(
      conversationId,
      { $pull: { deletedFor: { user: userId } } },
      { new: false },
    ).then(() => this.model.findByIdAndUpdate(
      conversationId,
      { $push: { deletedFor: { user: userId, deletedAt: new Date() } } },
      { new: true },
    ))
  }
}

module.exports = new ConversationRepository()
