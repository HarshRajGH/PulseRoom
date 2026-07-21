const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    year: { type: Number },
    coverUrl: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

albumSchema.index({ title: 'text' })

module.exports = mongoose.model('Album', albumSchema)
