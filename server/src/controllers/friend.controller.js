const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const friendService = require('../services/friend.service')

const send = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await friendService.sendRequest(req.user._id, req.body.toUserId), 'Friend request sent')))
const accept = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await friendService.respondToRequest(req.params.id, req.user._id, true), 'Friend request accepted')))
const reject = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await friendService.respondToRequest(req.params.id, req.user._id, false), 'Friend request rejected')))
const listIncoming = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await friendService.listIncoming(req.user._id))))
const listFriends = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await friendService.listFriends(req.user._id))))
const remove = asyncHandler(async (req, res) => { await friendService.removeFriend(req.user._id, req.params.id); res.json(new ApiResponse(200, null, 'Friend removed')) })

module.exports = { send, accept, reject, listIncoming, listFriends, remove }
