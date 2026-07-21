const ApiError = require('../utils/ApiError')
const directMessageRepository = require('../repositories/directMessage.repository')
const conversationRepository = require('../repositories/conversation.repository')
const notificationService = require('./notification.service')
const { uploadBuffer } = require('../config/cloudinary')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { NOTIFICATION_TYPE } = require('../utils/constants')

async function getThread(conversationId, userId, query) {
  const conversation = await conversationRepository.findByIdPopulated(conversationId)
  if (!conversation) throw ApiError.notFound('Conversation not found')
  if (!conversation.participants.some((p) => p._id.toString() === userId.toString())) {
    throw ApiError.forbidden("You don't have access to this conversation")
  }

  const { page, limit, skip } = getPagination(query)
  const [items, total] = query.q
    ? [await directMessageRepository.searchInThread(conversationId, query.q, { skip, limit }), await directMessageRepository.count({ conversation: conversationId, isDeleted: false, $text: { $search: query.q } })]
    : [await directMessageRepository.getThread(conversationId, userId, { skip, limit }), await directMessageRepository.countInThread(conversationId)]

  return buildPaginatedResponse(items.reverse(), total, page, limit)
}

async function sendMessage(conversationId, senderId, { text, attachments = [] }) {
  const conversation = await conversationRepository.findById(conversationId)
  if (!conversation) throw ApiError.notFound('Conversation not found')
  if (!conversation.participants.some((p) => p.toString() === senderId.toString())) {
    throw ApiError.forbidden("You don't have access to this conversation")
  }
  if (!text?.trim() && !attachments.length) throw ApiError.badRequest('Message must have text or an attachment')

  const recipientId = conversation.participants.find((p) => p.toString() !== senderId.toString())

  const message = await directMessageRepository.create({
    conversation: conversationId, sender: senderId, recipient: recipientId, text: text || '', attachments,
  })

  // A new message always un-hides the thread for both parties, even if
  // either had soft-deleted it previously.
  await conversationRepository.clearDeletedFor(conversationId, senderId)
  await conversationRepository.clearDeletedFor(conversationId, recipientId)
  await conversationRepository.updateById(conversationId, { lastMessage: message._id, lastMessageAt: message.createdAt })

  await notificationService.createNotification(recipientId, NOTIFICATION_TYPE.MESSAGE, 'You have a new message', { conversationId, messageId: message._id })

  return directMessageRepository.findById(message._id, ['sender', 'recipient'])
}

async function uploadAttachment(file) {
  const isImage = file.mimetype.startsWith('image/')
  const result = await uploadBuffer(file.buffer, 'syncwave/dm-attachments', isImage ? 'image' : 'auto')
  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: isImage ? 'image' : 'file',
    name: file.originalname,
    size: file.size,
  }
}

async function markThreadRead(conversationId, readerId) {
  const conversation = await conversationRepository.findById(conversationId)
  if (!conversation) throw ApiError.notFound('Conversation not found')
  if (!conversation.participants.some((p) => p.toString() === readerId.toString())) {
    throw ApiError.forbidden("You don't have access to this conversation")
  }
  return directMessageRepository.markThreadRead(conversationId, readerId)
}

async function deleteMessage(messageId, userId) {
  const message = await directMessageRepository.findById(messageId)
  if (!message) throw ApiError.notFound('Message not found')
  if (message.sender.toString() !== userId.toString()) throw ApiError.forbidden("You can't delete another user's message")
  message.isDeleted = true
  await message.save()
}

async function unreadCount(userId) {
  return directMessageRepository.unreadCountForUser(userId)
}

module.exports = { getThread, sendMessage, uploadAttachment, markThreadRead, deleteMessage, unreadCount }
