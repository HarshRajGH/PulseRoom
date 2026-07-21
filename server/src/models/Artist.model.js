const mongoose = require('mongoose')

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    bio: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    followers: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

artistSchema.index({ name: 'text', genre: 'text' })

module.exports = mongoose.model('Artist', artistSchema)
