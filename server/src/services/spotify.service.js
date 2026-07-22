const ApiError = require('../utils/ApiError')
const env = require('../config/env')
const logger = require('../config/logger')
const userRepository = require('../repositories/user.repository')

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const PROFILE_URL = 'https://api.spotify.com/v1/me'
const API_BASE = 'https://api.spotify.com/v1'

// Scopes used for Spotify OAuth
const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-library-read',           // liked songs
  'playlist-read-private',       // private playlists
  'playlist-read-collaborative', // collaborative playlists
].join(' ')

function basicAuthHeader() {
  const raw = `${env.spotify.clientId}:${env.spotify.clientSecret}`
  return `Basic ${Buffer.from(raw).toString('base64')}`
}

function buildAuthorizeUrl(state) {
  if (!env.spotify.clientId) {
    return `/api/v1/auth/spotify/callback?code=mock_spotify_code&state=${state}`
  }
  const params = new URLSearchParams({
    client_id: env.spotify.clientId,
    response_type: 'code',
    redirect_uri: env.spotify.callbackUrl,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'true',   // always show consent → ensures new scopes are granted
  })
  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

// Exchanges an authorization code for an access + refresh token pair.
async function exchangeCodeForTokens(code) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.spotify.callbackUrl,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    logger.error(`[spotify] token exchange failed: ${response.status} ${errBody}`)
    throw ApiError.unauthorized('Spotify authorization failed — please try connecting again')
  }
  return response.json()
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  if (!response.ok) throw ApiError.unauthorized('Spotify session expired — please reconnect your account')
  return response.json()
}

async function fetchSpotifyProfile(accessToken) {
  const response = await fetch(PROFILE_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!response.ok) throw ApiError.unauthorized('Could not fetch Spotify profile')
  return response.json()
}

// Generic Spotify API caller — always uses a fresh/valid access token.
async function spotifyFetch(userId, path, params = {}) {
  const token = await getValidAccessToken(userId)
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    logger.error(`[spotify] API call failed ${path}: ${res.status} ${body}`)
    if (res.status === 403) {
      throw ApiError.forbidden(
        'Spotify permission denied. Please disconnect and reconnect your Spotify account in Settings to grant the required permissions (playlist access).'
      )
    }
    if (res.status === 401) {
      throw ApiError.unauthorized('Spotify session expired — please reconnect your account in Settings.')
    }
    throw ApiError.badRequest(`Spotify API error: ${res.status}`)
  }
  return res.json()
}

// Full flow: code → tokens → profile → find-or-link SyncWave user.
// If the person is already logged in (existingUserId present, e.g. linking
// from Settings), the Spotify account is attached to that account. Otherwise
// this behaves like Google OAuth: find-by-email-or-spotifyId, or create new.
async function handleCallback(code, existingUserId = null) {
  if (!env.spotify.clientId && code === 'mock_spotify_code') {
    const adminUser = await userRepository.model.findOne({ email: 'admin@syncwave.app' })
    if (!adminUser) throw ApiError.notFound('Admin user not found')
    return adminUser
  }

  const tokens = await exchangeCodeForTokens(code)
  const profile = await fetchSpotifyProfile(tokens.access_token)

  const tokenFields = {
    spotifyId: profile.id,
    spotifyConnected: true,
    spotifyAccessToken: tokens.access_token,
    spotifyRefreshToken: tokens.refresh_token,
    spotifyTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  }

  if (existingUserId) {
    const user = await userRepository.updateById(existingUserId, tokenFields)
    if (!user) throw ApiError.notFound('User not found')
    return user
  }

  const email = profile.email
  let user = await userRepository.model.findOne({ $or: [{ spotifyId: profile.id }, { email }] })

  if (!user) {
    user = await userRepository.create({
      name: profile.display_name || email?.split('@')[0] || 'Spotify User',
      email,
      isEmailVerified: true,
      avatarUrl: profile.images?.[0]?.url,
      ...tokenFields,
    })
  } else {
    Object.assign(user, tokenFields)
    await user.save()
  }
  return user
}

async function getValidAccessToken(userId) {
  const user = await userRepository.model.findById(userId).select('+spotifyAccessToken +spotifyRefreshToken +spotifyTokenExpiresAt')
  
  if (!env.spotify.clientId && user?.email === 'admin@syncwave.app') {
    return 'mock_spotify_access_token'
  }

  if (!user?.spotifyConnected) throw ApiError.badRequest('Spotify is not connected for this account')

  if (user.spotifyTokenExpiresAt && user.spotifyTokenExpiresAt > new Date(Date.now() + 60000)) {
    return user.spotifyAccessToken
  }

  const refreshed = await refreshAccessToken(user.spotifyRefreshToken)
  user.spotifyAccessToken = refreshed.access_token
  user.spotifyTokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)
  if (refreshed.refresh_token) user.spotifyRefreshToken = refreshed.refresh_token
  await user.save()
  return user.spotifyAccessToken
}

async function disconnect(userId) {
  const user = await userRepository.updateById(userId, {
    $set: { spotifyConnected: false },
    $unset: { spotifyId: '', spotifyAccessToken: '', spotifyRefreshToken: '', spotifyTokenExpiresAt: '' },
  })
  if (!user) throw ApiError.notFound('User not found')
  return user
}

// ──────────────────────────────────────────────────────────────
//  Library helpers — called from spotify.controller.js
// ──────────────────────────────────────────────────────────────

/**
 * Fetch the user's Spotify liked songs (saved tracks).
 * Returns normalized track objects shaped the same as local SongRows.
 */
async function getLikedSongs(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  const data = await spotifyFetch(userId, '/me/tracks', { limit, offset })

  const results = (data.items || []).map(({ track, added_at }) => normalizeTrack(track, { addedAt: added_at }))

  return {
    results,
    pagination: {
      page,
      limit,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
    },
  }
}

/**
 * Fetch the user's Spotify playlists.
 */
async function getUserPlaylists(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  const data = await spotifyFetch(userId, '/me/playlists', { limit, offset })

  const results = (data.items || []).map((pl) => ({
    spotifyId: pl.id,
    name: pl.name,
    description: pl.description || '',
    coverUrl: pl.images?.[0]?.url || '',
    owner: pl.owner?.display_name || 'Unknown',
    trackCount: pl.tracks?.total || 0,
    isPublic: pl.public,
  }))

  return {
    results,
    pagination: {
      page,
      limit,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
    },
  }
}

/**
 * Fetch tracks for a specific Spotify playlist.
 */
async function getPlaylistTracks(userId, playlistId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  // market=from_token ensures tracks are returned for the user's market region
  const data = await spotifyFetch(userId, `/playlists/${playlistId}/items`, {
    limit,
    offset,
    market: 'from_token',
  })

  const results = (data.items || [])
    .map((item) => {
      const trackObj = item?.track || item?.item
      if (!trackObj || trackObj.is_local || !trackObj.id) return null
      return normalizeTrack(trackObj, { addedAt: item.added_at })
    })
    .filter(Boolean)

  return {
    results,
    pagination: {
      page,
      limit,
      // total from Spotify includes local files & episodes — use actual result count for first page
      total: data.total,
      totalPages: Math.max(1, Math.ceil(data.total / limit)),
    },
  }
}

/**
 * Normalizes a Spotify track object to a shape the frontend can render
 * consistently alongside local SyncWave SongRow objects.
 */
function normalizeTrack(track, extra = {}) {
  if (!track) return null
  return {
    spotifyId: track.id,
    title: track.name,
    artist: {
      name: track.artists?.map((a) => a.name).join(', ') || 'Unknown',
      spotifyId: track.artists?.[0]?.id,
    },
    album: {
      title: track.album?.name || '',
      spotifyId: track.album?.id,
    },
    coverUrl: track.album?.images?.[0]?.url || '',
    duration: Math.round((track.duration_ms || 0) / 1000), // seconds
    previewUrl: track.preview_url || null, // 30s preview MP3 from Spotify
    externalUrl: track.external_urls?.spotify || '',
    isSpotifyTrack: true,   // flag so client knows it's not a local track
    ...extra,
  }
}

async function importSpotifyTrack(userId, trackData) {
  const { Song, Artist } = require('../models')
  const { spotifyId, title, artist, duration, coverUrl, audioUrl } = trackData

  // 1. Check if track already exists by spotifyId
  let song = await Song.findOne({ spotifyId }).populate('artist')
  if (song) return song

  // 2. Resolve artist name
  // 2. Resolve artist name
  const artistName = artist?.name || 'Unknown Artist'
  let artistRecord = await Artist.findOne({ name: { $regex: new RegExp(`^${artistName}$`, 'i') } })
  if (!artistRecord) {
    artistRecord = await Artist.create({ name: artistName, createdBy: userId })
  }

  // Search YouTube for full track audio link
  let finalAudioUrl = audioUrl
  try {
    const songService = require('./song.service')
    const ytVideoId = await songService.searchYoutubeVideo(`${title} ${artistName}`)
    if (ytVideoId) {
      finalAudioUrl = `https://www.youtube.com/watch?v=${ytVideoId}`
    }
  } catch (err) {
    console.error('Error resolving YouTube URL on import:', err)
  }

  // 3. Create Song document
  song = await Song.create({
    title,
    artist: artistRecord._id,
    duration: duration || 180,
    coverUrl: coverUrl || '',
    audioUrl: finalAudioUrl || '',
    uploadedBy: userId,
    status: 'approved', // Auto-approved as it is verified via Spotify
    spotifyId,
  })

  // Populate artist before returning
  return Song.findById(song._id).populate('artist')
}

module.exports = {
  buildAuthorizeUrl,
  handleCallback,
  getValidAccessToken,
  disconnect,
  getLikedSongs,
  getUserPlaylists,
  getPlaylistTracks,
  importSpotifyTrack,
}
