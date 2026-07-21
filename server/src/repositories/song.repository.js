const BaseRepository = require('./BaseRepository')
const { Song } = require('../models')

class SongRepository extends BaseRepository {
  constructor() { super(Song) }

  search(term, { skip = 0, limit = 20 } = {}) {
    return this.model.find({ $text: { $search: term } }).skip(skip).limit(limit)
  }

  incrementPlays(id) {
    return this.model.findByIdAndUpdate(id, { $inc: { plays: 1 } }, { new: true })
  }

  async findLikedByUser(userId, { skip = 0, limit = 20, sort = '-createdAt', search } = {}) {
    const filter = { likedBy: userId }
    if (search) filter.$text = { $search: search }
    return this.model.find(filter).sort(sort).skip(skip).limit(limit).populate('artist').populate('album')
  }

  countLikedByUser(userId, search) {
    const filter = { likedBy: userId }
    if (search) filter.$text = { $search: search }
    return this.model.countDocuments(filter)
  }

  isLikedByUser(songId, userId) {
    return this.model.exists({ _id: songId, likedBy: userId })
  }

  addLike(songId, userId) {
    return this.model.findByIdAndUpdate(songId, { $addToSet: { likedBy: userId } }, { new: true })
  }

  removeLike(songId, userId) {
    return this.model.findByIdAndUpdate(songId, { $pull: { likedBy: userId } }, { new: true })
  }
}

module.exports = new SongRepository()
