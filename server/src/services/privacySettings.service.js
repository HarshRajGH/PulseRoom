const privacySettingsRepository = require('../repositories/privacySettings.repository')

const ALLOWED_FIELDS = [
  'isPrivateAccount', 'hideListeningActivity', 'allowFriendRequests', 'allowRoomInvites',
  'showOnlineStatus', 'profileVisibility', 'messagePermissions', 'notificationPreferences',
]

async function getSettings(userId) {
  return privacySettingsRepository.getOrCreate(userId)
}

async function updateSettings(userId, updates) {
  const payload = {}
  for (const key of ALLOWED_FIELDS) {
    if (updates[key] !== undefined) payload[key] = updates[key]
  }
  await privacySettingsRepository.getOrCreate(userId)
  return privacySettingsRepository.model.findOneAndUpdate(
    { user: userId },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
}

module.exports = { getSettings, updateSettings }
