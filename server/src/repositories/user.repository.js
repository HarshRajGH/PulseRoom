const BaseRepository = require('./BaseRepository')
const { User } = require('../models')

class UserRepository extends BaseRepository {
  constructor() { super(User) }

  findByEmail(email, withPassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase() })
    if (withPassword) query.select('+password')
    return query
  }

  findByIdWithPassword(id) {
    return this.model.findById(id).select('+password')
  }

  search(term, { skip = 0, limit = 20 } = {}) {
    return this.model
      .find({ $text: { $search: term }, isDeleted: false })
      .skip(skip).limit(limit)
  }
}

module.exports = new UserRepository()
