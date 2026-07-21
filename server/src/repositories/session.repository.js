const BaseRepository = require('./BaseRepository')
const { Session } = require('../models')

class SessionRepository extends BaseRepository {
  constructor() { super(Session) }

  findValidByHash(hash) {
    return this.model.findOne({ refreshTokenHash: hash, revokedAt: null, expiresAt: { $gt: new Date() } })
  }

  revokeAllForUser(userId) {
    return this.model.updateMany({ user: userId, revokedAt: null }, { $set: { revokedAt: new Date() } })
  }
}

module.exports = new SessionRepository()
