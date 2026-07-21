const BaseRepository = require('./BaseRepository')
const { Album } = require('../models')

class AlbumRepository extends BaseRepository {
  constructor() { super(Album) }
}

module.exports = new AlbumRepository()
