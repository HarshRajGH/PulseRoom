const mongoose = require('mongoose')

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    genre: { type: String, trim: true },
    duration: { type: Number, required: true },
    coverUrl: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    audioPublicId: { type: String, select: false },
    plays: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

songSchema.index({ title: 'text', genre: 'text' })
songSchema.index({ likedBy: 1 })

module.exports = mongoose.model('Song', songSchema)
