const BaseRepository = require('./BaseRepository')
const { Tip } = require('../models')

class TipRepository extends BaseRepository {
  constructor() { super(Tip) }

  findReceivedBy(userId, opts) {
    return this.find({ to: userId }, { ...opts, populate: ['from'] })
  }
}

module.exports = new TipRepository()
