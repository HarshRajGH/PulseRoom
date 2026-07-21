const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const analyticsService = require('../services/analytics.service')

const myAnalytics = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await analyticsService.getUserAnalytics(req.user._id, Number(req.query.days) || 7))))
const roomAnalytics = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await analyticsService.getRoomAnalytics(req.params.roomId, Number(req.query.days) || 7))))
const platformOverview = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await analyticsService.getPlatformOverview())))

module.exports = { myAnalytics, roomAnalytics, platformOverview }
