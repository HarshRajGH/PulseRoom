const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const recommendationService = require('../services/recommendation.service')

const songs = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await recommendationService.recommendSongs(req.user, Number(req.query.limit) || 12))))
const rooms = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await recommendationService.recommendRooms(Number(req.query.limit) || 8))))

module.exports = { songs, rooms }
