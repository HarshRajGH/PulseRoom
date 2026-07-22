const ApiError = require('../utils/ApiError')
const songRepository = require('../repositories/song.repository')
const auditLogRepository = require('../repositories/auditLog.repository')
const notificationService = require('./notification.service')
const { Artist } = require('../models')
const { uploadBuffer, destroyAsset } = require('../config/cloudinary')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { NOTIFICATION_TYPE, ROLES } = require('../utils/constants')

async function listSongs(query, user) {
  const { page, limit, skip } = getPagination(query)
  const filter = { status: 'approved' }
  
  if (query.genre) filter.genre = query.genre
  if (query.artist) filter.artist = query.artist
  if (query.q) filter.$text = { $search: query.q }

  const [items, total] = await Promise.all([
    songRepository.find(filter, { skip, limit, populate: ['artist', 'album'] }),
    songRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function listPendingSongs(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = { status: 'pending' }
  const [items, total] = await Promise.all([
    songRepository.find(filter, { skip, limit, populate: ['artist', 'album', 'uploadedBy'] }),
    songRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function listMySongs(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const filter = { uploadedBy: userId }
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
  if (!files.audio) throw ApiError.badRequest('Audio file is required')
  
  let artistRecord = await Artist.findOne({ name: { $regex: new RegExp(`^${data.artist}$`, 'i') } })
  if (!artistRecord) {
    artistRecord = await Artist.create({ name: data.artist, createdBy: userId })
  }

  const payload = { ...data, artist: artistRecord._id, uploadedBy: userId, status: 'pending' }
  
  if (files.cover) {
    const result = await uploadBuffer(files.cover[0].buffer, 'syncwave/covers', 'image')
    payload.coverUrl = result.secure_url
  }

  const mm = await import('music-metadata')
  const metadata = await mm.parseBuffer(files.audio[0].buffer, files.audio[0].mimetype)
  payload.duration = Math.round(metadata.format.duration || 0)
  if (payload.duration > 480) throw ApiError.badRequest('Song exceeds the 8-minute limit')

  const result = await uploadBuffer(files.audio[0].buffer, 'syncwave/audio', 'video')
  payload.audioUrl = result.secure_url
  payload.audioPublicId = result.public_id
  
  return songRepository.create(payload)
}

async function updateSong(id, userId, role, data) {
  const song = await songRepository.findById(id)
  if (!song) throw ApiError.notFound('Song not found')
  if (song.uploadedBy.toString() !== userId.toString() && role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You do not have permission to edit this song')
  }

  const updatedSong = await songRepository.updateById(id, data)
  return updatedSong
}

async function deleteSong(id, userId, role) {
  const song = await songRepository.findById(id)
  if (!song) throw ApiError.notFound('Song not found')
  if (song.uploadedBy.toString() !== userId.toString() && role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You do not have permission to delete this song')
  }

  if (song.audioPublicId) await destroyAsset(song.audioPublicId, 'video').catch(() => {})
  await songRepository.deleteById(id)
}

async function verifySong(adminId, songId, data) {
  const song = await songRepository.findById(songId)
  if (!song) throw ApiError.notFound('Song not found')

  song.status = data.status
  song.reviewedBy = adminId
  song.reviewedAt = new Date()
  
  if (data.status === 'rejected') {
    song.rejectionReason = data.rejectionReason || 'No reason provided'
    if (song.audioPublicId) await destroyAsset(song.audioPublicId, 'video').catch(() => {})
    song.audioUrl = ''
  }

  await song.save()

  const notifType = data.status === 'approved' ? NOTIFICATION_TYPE.SONG_APPROVED : NOTIFICATION_TYPE.SONG_REJECTED
  const notifText = data.status === 'approved' 
    ? `Your song "${song.title}" was approved and is now live!` 
    : `Your song "${song.title}" was rejected: ${song.rejectionReason}`
  
  await notificationService.createNotification(song.uploadedBy, notifType, notifText, { songId: song._id })
  
  await auditLogRepository.create({
    actor: adminId,
    action: `song.${data.status}`,
    targetType: 'Song',
    targetId: song._id,
    metadata: { reason: song.rejectionReason }
  })

  return song
}

async function registerPlay(id) {
  const song = await songRepository.incrementPlays(id)
  if (!song) throw ApiError.notFound('Song not found')
  return song
}

async function searchYoutubeVideo(query) {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    const html = await res.text()
    const regex = /"videoRenderer":{"videoId":"([a-zA-Z0-9_-]{11})"/g
    const matches = []
    let match
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1])
    }
    return matches[0] || null
  } catch (error) {
    logger.error('YouTube scraping failed: ' + error.message)
    return null
  }
}

module.exports = {
  listSongs,
  listPendingSongs,
  listMySongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  verifySong,
  registerPlay,
  searchYoutubeVideo,
}
