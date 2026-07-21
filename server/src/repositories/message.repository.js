const BaseRepository = require('./BaseRepository')
const { Message } = require('../models')

class MessageRepository extends BaseRepository {
  constructor() { super(Message) }

  getRoomMessages(roomId, { skip = 0, limit = 50 } = {}) {
    return this.model
      .find({ room: roomId, isDeleted: false })
      .sort('-createdAt').skip(skip).limit(limit)
      .populate('sender', 'name handle avatarUrl')
  }
}

module.exports = new MessageRepository()
