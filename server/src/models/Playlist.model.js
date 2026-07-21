const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    isCollaborative: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

playlistSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Playlist', playlistSchema)
