const mongoose = require('mongoose')

const privacySettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isPrivateAccount: { type: Boolean, default: false },
    hideListeningActivity: { type: Boolean, default: false },
    allowFriendRequests: { type: Boolean, default: true },
    allowRoomInvites: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
    messagePermissions: { type: String, enum: ['everyone', 'friends', 'none'], default: 'everyone' },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      tips: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('PrivacySettings', privacySettingsSchema)
