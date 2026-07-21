const mongoose = require('mongoose')

// Daily rollup document per user/room for lightweight analytics without
// scanning raw event tables on every dashboard load.
const analyticsSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['user', 'room', 'platform'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId },
    date: { type: String, required: true }, // YYYY-MM-DD
    listeningMinutes: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    newFollowers: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    tips: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
  },
  { timestamps: true },
)

analyticsSchema.index({ scope: 1, refId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Analytics', analyticsSchema)
