const ApiError = require('../utils/ApiError')
const userRepository = require('../repositories/user.repository')
const auditLogRepository = require('../repositories/auditLog.repository')
const { uploadBuffer, destroyAsset } = require('../config/cloudinary')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function getPublicProfile(userId) {
  const user = await userRepository.findById(userId)
  if (!user || user.isDeleted) throw ApiError.notFound('User not found')
  return user.toPublicJSON()
}

async function updateProfile(userId, updates) {
  const allowed = ['name', 'handle', 'bio']
  const payload = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))
  const user = await userRepository.updateById(userId, payload)
  if (!user) throw ApiError.notFound('User not found')
  return user.toPublicJSON()
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findByIdWithPassword(userId)
  if (!user.password) throw ApiError.badRequest('This account uses social login and has no password set')
  const valid = await user.comparePassword(currentPassword)
  if (!valid) throw ApiError.unauthorized('Current password is incorrect')
  user.password = newPassword
  await user.save()
}

async function uploadAvatar(userId, file) {
  const user = await userRepository.findById(userId)
  if (!user) throw ApiError.notFound('User not found')

  if (user.avatarPublicId) await destroyAsset(user.avatarPublicId).catch(() => {})

  const result = await uploadBuffer(file.buffer, 'syncwave/avatars', 'image')
  user.avatarUrl = result.secure_url
  user.avatarPublicId = result.public_id
  await user.save()
  return user.toPublicJSON()
}

async function listUsers(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = { isDeleted: false }
  if (query.role) filter.role = query.role
  if (query.q) filter.$text = { $search: query.q }

  const [users, total] = await Promise.all([
    userRepository.find(filter, { skip, limit }),
    userRepository.count(filter),
  ])
  return buildPaginatedResponse(users.map((u) => u.toPublicJSON()), total, page, limit)
}

async function updateUserRole(actorId, targetUserId, role) {
  const user = await userRepository.updateById(targetUserId, { role })
  if (!user) throw ApiError.notFound('User not found')
  await auditLogRepository.create({ actor: actorId, action: 'user.role_updated', targetType: 'User', targetId: targetUserId, metadata: { role } })
  return user.toPublicJSON()
}

async function setBlockedStatus(actorId, targetUserId, isBlocked) {
  const user = await userRepository.updateById(targetUserId, { isBlocked })
  if (!user) throw ApiError.notFound('User not found')
  await auditLogRepository.create({ actor: actorId, action: isBlocked ? 'user.blocked' : 'user.unblocked', targetType: 'User', targetId: targetUserId })
  return user.toPublicJSON()
}

async function softDeleteUser(actorId, targetUserId) {
  const user = await userRepository.updateById(targetUserId, { isDeleted: true })
  if (!user) throw ApiError.notFound('User not found')
  await auditLogRepository.create({ actor: actorId, action: 'user.deleted', targetType: 'User', targetId: targetUserId })
}

async function followUser(userId, targetUserId) {
  if (userId.toString() === targetUserId.toString()) throw ApiError.badRequest("You can't follow yourself")
  await userRepository.model.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } })
  await userRepository.model.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } })
}

async function unfollowUser(userId, targetUserId) {
  await userRepository.model.findByIdAndUpdate(userId, { $pull: { following: targetUserId } })
  await userRepository.model.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } })
}

async function blockUserAsUser(userId, targetUserId) {
  await userRepository.model.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetUserId } })
}

async function unblockUserAsUser(userId, targetUserId) {
  await userRepository.model.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetUserId } })
}

module.exports = {
  getPublicProfile, updateProfile, changePassword, uploadAvatar, listUsers,
  updateUserRole, setBlockedStatus, softDeleteUser, followUser, unfollowUser,
  blockUserAsUser, unblockUserAsUser,
}
