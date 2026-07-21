const Joi = require('joi')

const updatePrivacy = Joi.object({
  isPrivateAccount: Joi.boolean(),
  hideListeningActivity: Joi.boolean(),
  allowFriendRequests: Joi.boolean(),
  allowRoomInvites: Joi.boolean(),
  showOnlineStatus: Joi.boolean(),
  profileVisibility: Joi.string().valid('public', 'friends', 'private'),
  messagePermissions: Joi.string().valid('everyone', 'friends', 'none'),
  notificationPreferences: Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
    tips: Joi.boolean(),
    mentions: Joi.boolean(),
  }),
}).min(1)

module.exports = { updatePrivacy }
