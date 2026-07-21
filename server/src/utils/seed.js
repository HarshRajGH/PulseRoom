// Seeds a handful of realistic documents so the API has something to return
// immediately after `npm run seed`. Safe to re-run — it wipes the seeded
// collections first.
require('dotenv').config()
const connectDB = require('../config/db')
const logger = require('../config/logger')
const { User, Artist, Album, Song, Room, Playlist, Wallet } = require('../models')
const { ROLES } = require('./constants')

async function seed() {
  await connectDB()

  await Promise.all([
    User.deleteMany({}), Artist.deleteMany({}), Album.deleteMany({}),
    Song.deleteMany({}), Room.deleteMany({}), Playlist.deleteMany({}), Wallet.deleteMany({}),
  ])

  const admin = await User.create({ name: 'Admin User', email: 'admin@syncwave.app', password: 'password123', role: ROLES.ADMIN, isEmailVerified: true, handle: '@admin' })
  const host = await User.create({ name: 'Priya N.', email: 'priya@syncwave.app', password: 'password123', role: ROLES.HOST, isEmailVerified: true, handle: '@priyan' })
  const creator = await User.create({ name: 'Kilo Static', email: 'kilo@syncwave.app', password: 'password123', role: ROLES.CREATOR, isEmailVerified: true, handle: '@kilostatic' })
  const listener = await User.create({ name: 'Dev Kapoor', email: 'dev@syncwave.app', password: 'password123', role: ROLES.LISTENER, isEmailVerified: true, handle: '@devk' })

  await Promise.all([admin, host, creator, listener].map((u) => Wallet.create({ user: u._id })))

  const artist = await Artist.create({ name: 'Nova Halcyon', genre: 'Synthwave', verified: true, createdBy: creator._id })
  const album = await Album.create({ title: 'Afterglow Season', artist: artist._id, year: 2025, createdBy: creator._id })
  
  const artist2 = await Artist.create({ name: 'The Midnight Echo', genre: 'Lo-fi', verified: false, createdBy: creator._id })
  const album2 = await Album.create({ title: 'Neon Dreams', artist: artist2._id, year: 2024, createdBy: creator._id })

  const songs = await Song.insertMany([
    { title: 'Afterglow', artist: artist._id, album: album._id, genre: 'Synthwave', duration: 372, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80' },
    { title: 'Midnight Transit', artist: artist._id, album: album._id, genre: 'Synthwave', duration: 425, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300&q=80' },
    { title: 'Static Coastlines', artist: artist._id, album: album._id, genre: 'Synthwave', duration: 342, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80' },
    { title: 'Neon Horizon', artist: artist2._id, album: album2._id, genre: 'Lo-fi', duration: 302, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300&q=80' },
    { title: 'City Lights', artist: artist2._id, album: album2._id, genre: 'Lo-fi', duration: 353, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80' },
    { title: 'Cyber Drift', artist: artist2._id, album: album2._id, genre: 'Lo-fi', duration: 400, uploadedBy: creator._id, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80' },
  ])

  await Room.create({
    name: 'Sunday Static', description: 'Lo-fi textures for slow mornings.', genre: 'Lo-fi', mood: 'Chill',
    host: host._id, participants: [host._id], listenerCount: 1, currentTrack: songs[0]._id,
  })

  await Playlist.create({
    name: 'Late Night Drive', description: 'For empty highways and full tanks.',
    owner: listener._id, tracks: songs.map((s) => s._id), isPublic: true,
  })

  logger.info('Seed complete. Login with: admin@syncwave.app / priya@syncwave.app / kilo@syncwave.app / dev@syncwave.app — password123')
  process.exit(0)
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`)
  process.exit(1)
})
