const mongoose = require('mongoose')

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    genre: { type: String, trim: true },
    duration: { type: Number, required: true }, // Derived server-side
    coverUrl: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    audioPublicId: { type: String, select: false },
    plays: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Verification fields
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    
    // Spotify identifier for imports
    spotifyId: { type: String, sparse: true },
  },
  { timestamps: true },
)

songSchema.index({ title: 'text', genre: 'text' })
songSchema.index({ likedBy: 1 })
songSchema.index({ status: 1, uploadedBy: 1 })

module.exports = mongoose.model('Song', songSchema)
