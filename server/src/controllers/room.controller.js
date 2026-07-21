const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const roomService = require('../services/room.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.listRooms(req.query))))
const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.getRoom(req.params.id))))
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await roomService.createRoom(req.user._id, req.body), 'Room created')))
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.updateRoom(req.params.id, req.user._id, req.body), 'Room updated')))
const end = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.endRoom(req.params.id, req.user._id), 'Room ended')))
const join = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.joinRoom(req.params.id, req.user._id), 'Joined room')))
const leave = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.leaveRoom(req.params.id, req.user._id), 'Left room')))
const getQueue = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await roomService.getQueue(req.params.id))))

module.exports = { list, getOne, create, update, end, join, leave, getQueue }
