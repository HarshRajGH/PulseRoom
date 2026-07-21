const mongoose = require('mongoose')
const { ROOM_PRIVACY } = require('../utils/constants')

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genre: { type: String, trim: true },
    mood: { type: String, trim: true },
    coverUrl: { type: String, default: '' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    privacy: { type: String, enum: Object.values(ROOM_PRIVACY), default: ROOM_PRIVACY.PUBLIC },
    inviteCode: { type: String, unique: true, sparse: true },
    isLive: { type: Boolean, default: true },
    currentTrack: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    currentTrackStartedAt: { type: Date },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    listenerCount: { type: Number, default: 0 },
    bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    endedAt: { type: Date },
  },
  { timestamps: true },
)

roomSchema.index({ name: 'text', genre: 'text' })

module.exports = mongoose.model('Room', roomSchema)
