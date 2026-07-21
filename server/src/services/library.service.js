const ApiError = require('../utils/ApiError')
const songRepository = require('../repositories/song.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

const SORT_MAP = {
  recent: '-createdAt',
  oldest: 'createdAt',
  title: 'title',
  plays: '-plays',
}

async function listLikedSongs(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const sort = SORT_MAP[query.sort] || SORT_MAP.recent

  const [items, total] = await Promise.all([
    songRepository.findLikedByUser(userId, { skip, limit, sort, search: query.q }),
    songRepository.countLikedByUser(userId, query.q),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function likeSong(userId, songId) {
  const song = await songRepository.findById(songId)
  if (!song) throw ApiError.notFound('Song not found')

  const alreadyLiked = await songRepository.isLikedByUser(songId, userId)
  if (alreadyLiked) throw ApiError.conflict('Song is already in your liked songs')

  return songRepository.addLike(songId, userId)
}

async function unlikeSong(userId, songId) {
  const song = await songRepository.findById(songId)
  if (!song) throw ApiError.notFound('Song not found')
  return songRepository.removeLike(songId, userId)
}

module.exports = { listLikedSongs, likeSong, unlikeSong }
