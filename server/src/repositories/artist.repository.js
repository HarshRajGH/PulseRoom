const BaseRepository = require('./BaseRepository')
const { Artist } = require('../models')

class ArtistRepository extends BaseRepository {
  constructor() { super(Artist) }
}

module.exports = new ArtistRepository()
