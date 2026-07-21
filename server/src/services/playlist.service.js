const ApiError = require('../utils/ApiError')
const playlistRepository = require('../repositories/playlist.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function listMyPlaylists(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total] = await Promise.all([
    playlistRepository.findByOwnerOrCollaborator(userId, { skip, limit }),
    playlistRepository.count({ $or: [{ owner: userId }, { collaborators: userId }] }),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function getPlaylist(id) {
  const playlist = await playlistRepository.findById(id, ['owner', 'tracks', 'collaborators'])
  if (!playlist) throw ApiError.notFound('Playlist not found')
  return playlist
}

async function createPlaylist(userId, data) {
  return playlistRepository.create({ ...data, owner: userId })
}

function assertCanEdit(playlist, userId) {
  const isOwner = playlist.owner.toString() === userId.toString()
  const isCollaborator = playlist.collaborators.some((c) => c.toString() === userId.toString())
  if (!isOwner && !(playlist.isCollaborative && isCollaborator)) {
    throw ApiError.forbidden("You don't have permission to edit this playlist")
  }
}

async function updatePlaylist(id, userId, data) {
  const playlist = await playlistRepository.findById(id)
  if (!playlist) throw ApiError.notFound('Playlist not found')
  assertCanEdit(playlist, userId)
  Object.assign(playlist, data)
  await playlist.save()
  return playlist
}

async function deletePlaylist(id, userId) {
  const playlist = await playlistRepository.findById(id)
  if (!playlist) throw ApiError.notFound('Playlist not found')
  if (playlist.owner.toString() !== userId.toString()) throw ApiError.forbidden('Only the owner can delete this playlist')
  await playlistRepository.deleteById(id)
}

async function addTrack(id, userId, songId) {
  const playlist = await playlistRepository.findById(id)
  if (!playlist) throw ApiError.notFound('Playlist not found')
  assertCanEdit(playlist, userId)
  if (!playlist.tracks.some((t) => t.toString() === songId)) playlist.tracks.push(songId)
  await playlist.save()
  return playlist
}

async function removeTrack(id, userId, songId) {
  const playlist = await playlistRepository.findById(id)
  if (!playlist) throw ApiError.notFound('Playlist not found')
  assertCanEdit(playlist, userId)
  playlist.tracks = playlist.tracks.filter((t) => t.toString() !== songId)
  await playlist.save()
  return playlist
}

async function toggleFollow(id, userId) {
  const playlist = await playlistRepository.findById(id)
  if (!playlist) throw ApiError.notFound('Playlist not found')
  const following = playlist.followers.some((f) => f.toString() === userId.toString())
  const update = following ? { $pull: { followers: userId } } : { $addToSet: { followers: userId } }
  return playlistRepository.model.findByIdAndUpdate(id, update, { new: true })
}

module.exports = {
  listMyPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist,
  addTrack, removeTrack, toggleFollow,
}
