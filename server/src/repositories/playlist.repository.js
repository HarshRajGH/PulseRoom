const BaseRepository = require('./BaseRepository')
const { Playlist } = require('../models')

class PlaylistRepository extends BaseRepository {
  constructor() { super(Playlist) }

  findByOwnerOrCollaborator(userId, opts) {
    return this.find({ $or: [{ owner: userId }, { collaborators: userId }] }, opts)
  }
}

module.exports = new PlaylistRepository()
