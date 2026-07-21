const { Song, Room } = require('../models')

// Lightweight content-based recommender: scores songs by shared genre with
// the user's most-liked genre, and surfaces the busiest live rooms. Swappable
// later for a real ML-based engine without touching the controller layer.
async function recommendSongs(user, limit = 12) {
  const likedSongs = await Song.find({ likedBy: user._id }).select('genre')
  const genreCounts = likedSongs.reduce((acc, s) => {
    acc[s.genre] = (acc[s.genre] || 0) + 1
    return acc
  }, {})
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const filter = topGenre ? { genre: topGenre } : {}
  return Song.find(filter).sort('-plays').limit(limit).populate('artist')
}

async function recommendRooms(limit = 8) {
  return Room.find({ isLive: true }).sort('-listenerCount').limit(limit).populate('host', 'name handle avatarUrl')
}

module.exports = { recommendSongs, recommendRooms }
