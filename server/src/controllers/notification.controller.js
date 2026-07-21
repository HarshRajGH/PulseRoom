const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const notificationService = require('../services/notification.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await notificationService.listForUser(req.user._id, req.query))))
const markRead = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await notificationService.markRead(req.params.id, req.user._id), 'Marked as read')))
const markAllRead = asyncHandler(async (req, res) => { await notificationService.markAllRead(req.user._id); res.json(new ApiResponse(200, null, 'All marked as read')) })
const remove = asyncHandler(async (req, res) => { await notificationService.remove(req.params.id, req.user._id); res.json(new ApiResponse(200, null, 'Notification deleted')) })

module.exports = { list, markRead, markAllRead, remove }
