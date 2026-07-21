const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const libraryService = require('../services/library.service')

const listLiked = asyncHandler(async (req, res) => {
  const result = await libraryService.listLikedSongs(req.user._id, req.query)
  res.json(new ApiResponse(200, result))
})

const like = asyncHandler(async (req, res) => {
  const song = await libraryService.likeSong(req.user._id, req.params.songId)
  res.status(201).json(new ApiResponse(201, song, 'Added to liked songs'))
})

const unlike = asyncHandler(async (req, res) => {
  const song = await libraryService.unlikeSong(req.user._id, req.params.songId)
  res.json(new ApiResponse(200, song, 'Removed from liked songs'))
})

module.exports = { listLiked, like, unlike }
