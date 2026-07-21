const BaseRepository = require('./BaseRepository')
const { Vote } = require('../models')

class VoteRepository extends BaseRepository {
  constructor() { super(Vote) }

  getQueue(roomId) {
    return this.model
      .find({ room: roomId, played: false })
      .sort({ voteCount: -1, createdAt: 1 })
      .populate('song')
      .populate('addedBy', 'name handle avatarUrl')
  }
}

module.exports = new VoteRepository()
