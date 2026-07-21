const ApiError = require('../utils/ApiError')
const artistRepository = require('../repositories/artist.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function listArtists(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = query.genre ? { genre: query.genre } : {}
  const [items, total] = await Promise.all([
    artistRepository.find(filter, { skip, limit }),
    artistRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function getArtist(id) {
  const artist = await artistRepository.findById(id)
  if (!artist) throw ApiError.notFound('Artist not found')
  return artist
}

async function createArtist(userId, data) {
  return artistRepository.create({ ...data, createdBy: userId })
}

async function updateArtist(id, data) {
  const artist = await artistRepository.updateById(id, data)
  if (!artist) throw ApiError.notFound('Artist not found')
  return artist
}

async function deleteArtist(id) {
  const artist = await artistRepository.deleteById(id)
  if (!artist) throw ApiError.notFound('Artist not found')
}

module.exports = { listArtists, getArtist, createArtist, updateArtist, deleteArtist }
