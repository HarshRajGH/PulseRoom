const mongoose = require('mongoose')
const { FRIEND_REQUEST_STATUS } = require('../utils/constants')

const friendRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(FRIEND_REQUEST_STATUS), default: FRIEND_REQUEST_STATUS.PENDING },
  },
  { timestamps: true },
)

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true })

module.exports = mongoose.model('FriendRequest', friendRequestSchema)
