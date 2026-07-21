const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const conversationService = require('../services/conversation.service')
const directMessageService = require('../services/directMessage.service')

const start = asyncHandler(async (req, res) => {
  const conversation = await conversationService.getOrCreateConversation(req.user._id, req.body.userId)
  res.status(201).json(new ApiResponse(201, conversation))
})

const list = asyncHandler(async (req, res) => {
  if (req.query.q) {
    const results = await conversationService.searchConversations(req.user._id, req.query.q)
    return res.json(new ApiResponse(200, { results, pagination: null }))
  }
  const result = await conversationService.listConversations(req.user._id, req.query)
  res.json(new ApiResponse(200, result))
})

const getOne = asyncHandler(async (req, res) => {
  const conversation = await conversationService.getConversation(req.params.id, req.user._id)
  res.json(new ApiResponse(200, conversation))
})

const remove = asyncHandler(async (req, res) => {
  await conversationService.softDeleteConversation(req.params.id, req.user._id)
  res.json(new ApiResponse(200, null, 'Conversation removed from your inbox'))
})

const getMessages = asyncHandler(async (req, res) => {
  const result = await directMessageService.getThread(req.params.id, req.user._id, req.query)
  res.json(new ApiResponse(200, result))
})

const postMessage = asyncHandler(async (req, res) => {
  const message = await directMessageService.sendMessage(req.params.id, req.user._id, req.body)
  res.status(201).json(new ApiResponse(201, message, 'Message sent'))
})

const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json(new ApiResponse(400, null, 'No file uploaded'))
  const attachment = await directMessageService.uploadAttachment(req.file)
  res.status(201).json(new ApiResponse(201, attachment, 'Attachment uploaded'))
})

const markRead = asyncHandler(async (req, res) => {
  await directMessageService.markThreadRead(req.params.id, req.user._id)
  res.json(new ApiResponse(200, null, 'Thread marked as read'))
})

const deleteMessage = asyncHandler(async (req, res) => {
  await directMessageService.deleteMessage(req.params.messageId, req.user._id)
  res.json(new ApiResponse(200, null, 'Message deleted'))
})

const unreadCount = asyncHandler(async (req, res) => {
  const count = await directMessageService.unreadCount(req.user._id)
  res.json(new ApiResponse(200, { count }))
})

module.exports = { start, list, getOne, remove, getMessages, postMessage, uploadAttachment, markRead, deleteMessage, unreadCount }
