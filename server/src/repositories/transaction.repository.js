const BaseRepository = require('./BaseRepository')
const { Transaction } = require('../models')

class TransactionRepository extends BaseRepository {
  constructor() { super(Transaction) }

  findByUser(userId, opts) {
    return this.find({ user: userId }, opts)
  }
}

module.exports = new TransactionRepository()
