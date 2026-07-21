const BaseRepository = require('./BaseRepository')
const { Room } = require('../models')

class RoomRepository extends BaseRepository {
  constructor() { super(Room) }

  findLive(opts) {
    return this.find({ isLive: true }, opts)
  }
}

module.exports = new RoomRepository()
