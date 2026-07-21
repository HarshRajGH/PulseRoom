const ApiError = require('../utils/ApiError')
const friendRequestRepository = require('../repositories/friendRequest.repository')
const userRepository = require('../repositories/user.repository')
const notificationService = require('./notification.service')
const { FRIEND_REQUEST_STATUS, NOTIFICATION_TYPE } = require('../utils/constants')

async function sendRequest(fromId, toId) {
  if (fromId.toString() === toId.toString()) throw ApiError.badRequest("You can't friend-request yourself")
  const existing = await friendRequestRepository.findOne({ from: fromId, to: toId })
  if (existing) throw ApiError.conflict('Friend request already sent')

  const request = await friendRequestRepository.create({ from: fromId, to: toId })
  const sender = await userRepository.findById(fromId)
  await notificationService.createNotification(toId, NOTIFICATION_TYPE.FRIEND_REQUEST, `${sender.name} sent you a friend request`, { requestId: request._id })
  return request
}

async function respondToRequest(requestId, userId, accept) {
  const request = await friendRequestRepository.findById(requestId)
  if (!request) throw ApiError.notFound('Friend request not found')
  if (request.to.toString() !== userId.toString()) throw ApiError.forbidden('This request is not addressed to you')

  request.status = accept ? FRIEND_REQUEST_STATUS.ACCEPTED : FRIEND_REQUEST_STATUS.REJECTED
  await request.save()

  if (accept) {
    await userRepository.model.findByIdAndUpdate(request.from, { $addToSet: { following: request.to } })
    await userRepository.model.findByIdAndUpdate(request.to, { $addToSet: { following: request.from } })
  }
  return request
}

async function listIncoming(userId) {
  return friendRequestRepository.find({ to: userId, status: FRIEND_REQUEST_STATUS.PENDING }, { populate: ['from'] })
}

async function listFriends(userId) {
  const user = await userRepository.findById(userId, ['following'])
  return user.following
}

async function removeFriend(userId, friendId) {
  await userRepository.model.findByIdAndUpdate(userId, { $pull: { following: friendId, followers: friendId } })
  await userRepository.model.findByIdAndUpdate(friendId, { $pull: { following: userId, followers: userId } })
}

module.exports = { sendRequest, respondToRequest, listIncoming, listFriends, removeFriend }
