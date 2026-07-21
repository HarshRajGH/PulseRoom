const BaseRepository = require('./BaseRepository')
const { FriendRequest } = require('../models')

class FriendRequestRepository extends BaseRepository {
  constructor() { super(FriendRequest) }
}

module.exports = new FriendRequestRepository()
