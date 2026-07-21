const ApiError = require('../utils/ApiError')
const conversationRepository = require('../repositories/conversation.repository')
const privacySettingsRepository = require('../repositories/privacySettings.repository')
const userRepository = require('../repositories/user.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function assertCanMessage(fromId, toId) {
  if (fromId.toString() === toId.toString()) throw ApiError.badRequest("You can't message yourself")

  const [target, targetPrivacy] = await Promise.all([
    userRepository.findById(toId),
    privacySettingsRepository.findByUser(toId),
  ])
  if (!target || target.isDeleted) throw ApiError.notFound('User not found')
  if (target.blockedUsers?.some((id) => id.toString() === fromId.toString())) {
    throw ApiError.forbidden('You cannot message this user')
  }

  const permission = targetPrivacy?.messagePermissions || 'everyone'
  if (permission === 'none') throw ApiError.forbidden('This user is not accepting messages')
  if (permission === 'friends') {
    const fromUser = await userRepository.findById(fromId)
    const isFriend = fromUser.following?.some((id) => id.toString() === toId.toString())
    if (!isFriend) throw ApiError.forbidden('This user only accepts messages from friends')
  }
}

async function getOrCreateConversation(userId, otherUserId) {
  await assertCanMessage(userId, otherUserId)
  let conversation = await conversationRepository.findBetween(userId, otherUserId)
  if (!conversation) {
    conversation = await conversationRepository.create({ participants: [userId, otherUserId] })
  }
  return conversationRepository.findByIdPopulated(conversation._id)
}

async function listConversations(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total] = await Promise.all([
    conversationRepository.listForUser(userId, { skip, limit }),
    conversationRepository.countForUser(userId),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function searchConversations(userId, term) {
  const conversations = await conversationRepository.model
    .find({ participants: userId, 'deletedFor.user': { $ne: userId } })
    .populate('participants', 'name handle avatarUrl')
    .populate('lastMessage')
    .sort('-lastMessageAt')
    .limit(50)

  const needle = term.toLowerCase()
  return conversations.filter((c) => c.participants.some((p) => p._id.toString() !== userId.toString() && (p.name.toLowerCase().includes(needle) || p.handle?.toLowerCase().includes(needle))))
}

async function getConversation(id, userId) {
  const conversation = await conversationRepository.findByIdPopulated(id)
  if (!conversation) throw ApiError.notFound('Conversation not found')
  if (!conversation.participants.some((p) => p._id.toString() === userId.toString())) {
    throw ApiError.forbidden("You don't have access to this conversation")
  }
  return conversation
}

async function softDeleteConversation(id, userId) {
  await getConversation(id, userId)
  return conversationRepository.softDeleteFor(id, userId)
}

module.exports = { getOrCreateConversation, listConversations, searchConversations, getConversation, softDeleteConversation }
