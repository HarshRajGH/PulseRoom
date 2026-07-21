const ApiError = require('../utils/ApiError')
const songRepository = require('../repositories/song.repository')
const { uploadBuffer } = require('../config/cloudinary')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

async function listSongs(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = {}
  if (query.genre) filter.genre = query.genre
  if (query.artist) filter.artist = query.artist
  if (query.q) filter.$text = { $search: query.q }

  const [items, total] = await Promise.all([
    songRepository.find(filter, { skip, limit, populate: ['artist', 'album'] }),
    songRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function getSong(id) {
  const song = await songRepository.findById(id, ['artist', 'album'])
  if (!song) throw ApiError.notFound('Song not found')
  return song
}

async function createSong(userId, data, files = {}) {
  const payload = { ...data, uploadedBy: userId }
  if (files.cover) {
    const result = await uploadBuffer(files.cover[0].buffer, 'syncwave/covers', 'image')
    payload.coverUrl = result.secure_url
  }
  if (files.audio) {
    const result = await uploadBuffer(files.audio[0].buffer, 'syncwave/audio', 'video')
    payload.audioUrl = result.secure_url
    payload.audioPublicId = result.public_id
  }
  return songRepository.create(payload)
}

async function updateSong(id, data) {
  const song = await songRepository.updateById(id, data)
  if (!song) throw ApiError.notFound('Song not found')
  return song
}

async function deleteSong(id) {
  const song = await songRepository.deleteById(id)
  if (!song) throw ApiError.notFound('Song not found')
}

async function registerPlay(id) {
  const song = await songRepository.incrementPlays(id)
  if (!song) throw ApiError.notFound('Song not found')
  return song
}

module.exports = { listSongs, getSong, createSong, updateSong, deleteSong, registerPlay }
