const ApiError = require('../utils/ApiError')
const messageRepository = require('../repositories/message.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function listRoomMessages(roomId, query) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 50 })
  const [items, total] = await Promise.all([
    messageRepository.getRoomMessages(roomId, { skip, limit }),
    messageRepository.count({ room: roomId, isDeleted: false }),
  ])
  return buildPaginatedResponse(items.reverse(), total, page, limit)
}

async function postMessage(roomId, senderId, text) {
  return messageRepository.create({ room: roomId, sender: senderId, text })
}

async function deleteMessage(messageId, userId, isModerator) {
  const message = await messageRepository.findById(messageId)
  if (!message) throw ApiError.notFound('Message not found')
  if (!isModerator && message.sender.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can't delete another user's message")
  }
  message.isDeleted = true
  await message.save()
}

module.exports = { listRoomMessages, postMessage, deleteMessage }
