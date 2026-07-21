const mongoose = require('mongoose')

// One queue entry per song-in-room; votes[] tracks which users upvoted it
// so a user can only vote once per queued track.
const voteSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 },
    played: { type: Boolean, default: false },
    playedAt: { type: Date },
  },
  { timestamps: true },
)

voteSchema.index({ room: 1, played: 1, voteCount: -1 })

module.exports = mongoose.model('Vote', voteSchema)
