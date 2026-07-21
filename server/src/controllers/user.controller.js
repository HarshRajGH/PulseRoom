const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const userService = require('../services/user.service')

const getMyProfile = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user.toPublicJSON()))
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getPublicProfile(req.params.id)
  res.json(new ApiResponse(200, user))
})

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body)
  res.json(new ApiResponse(200, user, 'Profile updated'))
})

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword)
  res.json(new ApiResponse(200, null, 'Password updated'))
})

const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.uploadAvatar(req.user._id, req.file)
  res.json(new ApiResponse(200, user, 'Avatar updated'))
})

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query)
  res.json(new ApiResponse(200, result))
})

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.user._id, req.params.id, req.body.role)
  res.json(new ApiResponse(200, user, 'Role updated'))
})

const blockUser = asyncHandler(async (req, res) => {
  const user = await userService.setBlockedStatus(req.user._id, req.params.id, true)
  res.json(new ApiResponse(200, user, 'User blocked'))
})

const unblockUser = asyncHandler(async (req, res) => {
  const user = await userService.setBlockedStatus(req.user._id, req.params.id, false)
  res.json(new ApiResponse(200, user, 'User unblocked'))
})

const deleteUser = asyncHandler(async (req, res) => {
  await userService.softDeleteUser(req.user._id, req.params.id)
  res.json(new ApiResponse(200, null, 'User deleted'))
})

const follow = asyncHandler(async (req, res) => {
  await userService.followUser(req.user._id, req.params.id)
  res.json(new ApiResponse(200, null, 'Followed'))
})

const unfollow = asyncHandler(async (req, res) => {
  await userService.unfollowUser(req.user._id, req.params.id)
  res.json(new ApiResponse(200, null, 'Unfollowed'))
})

const blockAsUser = asyncHandler(async (req, res) => {
  await userService.blockUserAsUser(req.user._id, req.params.id)
  res.json(new ApiResponse(200, null, 'User blocked'))
})

const unblockAsUser = asyncHandler(async (req, res) => {
  await userService.unblockUserAsUser(req.user._id, req.params.id)
  res.json(new ApiResponse(200, null, 'User unblocked'))
})

module.exports = {
  getMyProfile, getUserById, updateProfile, changePassword, uploadAvatar,
  listUsers, updateUserRole, blockUser, unblockUser, deleteUser,
  follow, unfollow, blockAsUser, unblockAsUser,
}
