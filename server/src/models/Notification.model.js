const mongoose = require('mongoose')
const { NOTIFICATION_TYPE } = require('../utils/constants')

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    text: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
)

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
