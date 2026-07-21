const { Song, Room, Playlist, User } = require('../models')

async function globalSearch(term, limit = 6) {
  if (!term) return { songs: [], rooms: [], playlists: [], users: [] }

  const [songs, rooms, playlists, users] = await Promise.all([
    Song.find({ $text: { $search: term } }).limit(limit).populate('artist'),
    Room.find({ $text: { $search: term } }).limit(limit).populate('host', 'name handle avatarUrl'),
    Playlist.find({ $text: { $search: term }, isPublic: true }).limit(limit),
    User.find({ $text: { $search: term }, isDeleted: false }).limit(limit).select('name handle avatarUrl'),
  ])

  return { songs, rooms, playlists, users }
}

module.exports = { globalSearch }
