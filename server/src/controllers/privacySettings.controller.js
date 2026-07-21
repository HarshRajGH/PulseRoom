const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const privacySettingsService = require('../services/privacySettings.service')

const getMine = asyncHandler(async (req, res) => {
  const settings = await privacySettingsService.getSettings(req.user._id)
  res.json(new ApiResponse(200, settings))
})

const updateMine = asyncHandler(async (req, res) => {
  const settings = await privacySettingsService.updateSettings(req.user._id, req.body)
  res.json(new ApiResponse(200, settings, 'Privacy settings updated'))
})

module.exports = { getMine, updateMine }
