const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    isDeleted: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true },
)

messageSchema.index({ room: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)
