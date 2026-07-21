const BaseRepository = require('./BaseRepository')
const { PrivacySettings } = require('../models')

class PrivacySettingsRepository extends BaseRepository {
  constructor() { super(PrivacySettings) }

  findByUser(userId) {
    return this.model.findOne({ user: userId })
  }

  getOrCreate(userId) {
    return this.model.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
  }
}

module.exports = new PrivacySettingsRepository()
