const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const messageService = require('../services/message.service')
const { ROLES } = require('../utils/constants')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await messageService.listRoomMessages(req.params.roomId, req.query))))

const create = asyncHandler(async (req, res) => {
  const message = await messageService.postMessage(req.params.roomId, req.user._id, req.body.text)
  res.status(201).json(new ApiResponse(201, message, 'Message sent'))
})

const remove = asyncHandler(async (req, res) => {
  const isModerator = [ROLES.ADMIN, ROLES.HOST].includes(req.user.role)
  await messageService.deleteMessage(req.params.id, req.user._id, isModerator)
  res.json(new ApiResponse(200, null, 'Message deleted'))
})

module.exports = { list, create, remove }
