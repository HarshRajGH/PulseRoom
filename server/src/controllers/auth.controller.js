const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const authService = require('../services/auth.service')
const spotifyService = require('../services/spotify.service')
const { signStateToken, verifyStateToken } = require('../utils/tokens')
const env = require('../config/env')

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, REFRESH_COOKIE_OPTS)
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body)
  res.status(201).json(new ApiResponse(201, user, 'Account created — check your email to verify it.'))
})

const login = asyncHandler(async (req, res) => {
  const meta = { userAgent: req.headers['user-agent'], ip: req.ip }
  const { user, accessToken, refreshToken } = await authService.login(req.body, meta)
  setRefreshCookie(res, refreshToken)
  res.json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Logged in successfully'))
})

const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken
  const { user, accessToken, refreshToken } = await authService.refresh(token)
  setRefreshCookie(res, refreshToken)
  res.json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Token refreshed'))
})

const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken
  await authService.logout(token)
  res.clearCookie('refreshToken')
  res.json(new ApiResponse(200, null, 'Logged out'))
})

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user._id)
  res.clearCookie('refreshToken')
  res.json(new ApiResponse(200, null, 'Logged out of all devices'))
})

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email)
  res.json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent.'))
})

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password)
  res.json(new ApiResponse(200, null, 'Password reset successfully — please log in.'))
})

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token)
  res.json(new ApiResponse(200, user, 'Email verified'))
})

const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user.toPublicJSON(), 'Current user'))
})

// OAuth callbacks — Google via Passport; Spotify via a manual authorization-code
// exchange (see spotify.service.js) since passport-spotify isn't a dependency here.
const oauthCallback = asyncHandler(async (req, res) => {
  const meta = { userAgent: req.headers['user-agent'], ip: req.ip }
  const { accessToken, refreshToken } = await authService.loginWithOAuthUser(req.user, meta)
  setRefreshCookie(res, refreshToken)
  res.redirect(`${env.clientUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`)
})

// Spotify OAuth — full authorization-code flow (see spotify.service.js for
// the token exchange / refresh / profile fetch logic).
const spotifyAuthorize = asyncHandler(async (req, res) => {
  const state = signStateToken({ purpose: 'spotify-login' })
  res.redirect(spotifyService.buildAuthorizeUrl(state))
})

// Initiates linking Spotify to an *already logged-in* SyncWave account
// (e.g. from Settings → Integrations). Returns the authorize URL as JSON
// rather than redirecting directly — the access token lives in memory on
// the client, not a cookie, so this must be called via an authenticated
// XHR first; the frontend then navigates the browser to the returned URL.
const spotifyLinkAuthorize = asyncHandler(async (req, res) => {
  const state = signStateToken({ purpose: 'spotify-link', userId: req.user._id.toString() })
  res.json(new ApiResponse(200, { url: spotifyService.buildAuthorizeUrl(state) }))
})

const spotifyCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query

  if (error) return res.redirect(`${env.clientUrl}/login?spotifyError=${encodeURIComponent(error)}`)
  if (!code || !state) return res.redirect(`${env.clientUrl}/login?spotifyError=missing_code`)

  let statePayload
  try {
    statePayload = verifyStateToken(state)
  } catch {
    return res.redirect(`${env.clientUrl}/login?spotifyError=invalid_state`)
  }

  try {
    if (statePayload.purpose === 'spotify-link') {
      await spotifyService.handleCallback(code, statePayload.userId)
      return res.redirect(`${env.clientUrl}/app/settings?spotifyLinked=true`)
    }

    const user = await spotifyService.handleCallback(code, null)
    const meta = { userAgent: req.headers['user-agent'], ip: req.ip }
    const { accessToken, refreshToken } = await authService.loginWithOAuthUser(user, meta)
    setRefreshCookie(res, refreshToken)
    res.redirect(`${env.clientUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`)
  } catch (err) {
    const redirectTarget = statePayload.purpose === 'spotify-link' ? '/app/settings' : '/login'
    res.redirect(`${env.clientUrl}${redirectTarget}?spotifyError=${encodeURIComponent(err.message)}`)
  }
})

const spotifyDisconnect = asyncHandler(async (req, res) => {
  const user = await spotifyService.disconnect(req.user._id)
  res.json(new ApiResponse(200, user.toPublicJSON(), 'Spotify account disconnected'))
})

module.exports = {
  register, login, refresh, logout, logoutAll, forgotPassword,
  resetPassword, verifyEmail, me, oauthCallback,
  spotifyAuthorize, spotifyLinkAuthorize, spotifyCallback, spotifyDisconnect,
}
