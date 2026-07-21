const ApiError = require('../utils/ApiError')
const albumRepository = require('../repositories/album.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function listAlbums(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = query.artist ? { artist: query.artist } : {}
  const [items, total] = await Promise.all([
    albumRepository.find(filter, { skip, limit, populate: ['artist'] }),
    albumRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function getAlbum(id) {
  const album = await albumRepository.findById(id, ['artist'])
  if (!album) throw ApiError.notFound('Album not found')
  return album
}

async function createAlbum(userId, data) {
  return albumRepository.create({ ...data, createdBy: userId })
}

async function deleteAlbum(id) {
  const album = await albumRepository.deleteById(id)
  if (!album) throw ApiError.notFound('Album not found')
}

module.exports = { listAlbums, getAlbum, createAlbum, deleteAlbum }
