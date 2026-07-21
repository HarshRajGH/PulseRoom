const BaseRepository = require('./BaseRepository')
const { Subscription } = require('../models')

class SubscriptionRepository extends BaseRepository {
  constructor() { super(Subscription) }

  findActiveByUser(userId) {
    return this.model.findOne({ user: userId, isActive: true }).sort('-createdAt')
  }
}

module.exports = new SubscriptionRepository()
