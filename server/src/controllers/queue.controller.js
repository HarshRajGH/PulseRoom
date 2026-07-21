const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const queueService = require('../services/queue.service')
const { ROLES } = require('../utils/constants')

const addToQueue = asyncHandler(async (req, res) => {
  const entry = await queueService.addToQueue(req.params.roomId, req.user._id, req.body.songId)
  res.status(201).json(new ApiResponse(201, entry, 'Added to queue'))
})

const upvote = asyncHandler(async (req, res) => {
  const entry = await queueService.upvote(req.params.voteId, req.user._id)
  res.json(new ApiResponse(200, entry, 'Vote counted'))
})

const removeFromQueue = asyncHandler(async (req, res) => {
  const isPrivileged = [ROLES.ADMIN, ROLES.HOST].includes(req.user.role)
  await queueService.removeFromQueue(req.params.voteId, req.user._id, isPrivileged)
  res.json(new ApiResponse(200, null, 'Removed from queue'))
})

module.exports = { addToQueue, upvote, removeFromQueue }
