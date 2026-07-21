const BaseRepository = require('./BaseRepository')
const { Wallet } = require('../models')

class WalletRepository extends BaseRepository {
  constructor() { super(Wallet) }

  findByUser(userId) {
    return this.model.findOne({ user: userId })
  }

  getOrCreate(userId) {
    return this.model.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true },
    )
  }
}

module.exports = new WalletRepository()
