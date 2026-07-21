const ApiError = require('../utils/ApiError')
const env = require('../config/env')
const logger = require('../config/logger')
const userRepository = require('../repositories/user.repository')

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const PROFILE_URL = 'https://api.spotify.com/v1/me'

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
    scope: 'user-read-email user-read-private user-top-read',
    state,
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

module.exports = { buildAuthorizeUrl, handleCallback, getValidAccessToken, disconnect }
