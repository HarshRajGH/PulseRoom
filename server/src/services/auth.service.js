const ApiError = require('../utils/ApiError')
const userRepository = require('../repositories/user.repository')
const sessionRepository = require('../repositories/session.repository')
const walletRepository = require('../repositories/wallet.repository')
const {
  signAccessToken, signRefreshToken, verifyRefreshToken,
  generateRandomToken, hashToken,
} = require('../utils/tokens')
const emailService = require('./email.service')
const { ROLES } = require('../utils/constants')

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function buildAuthTokens(user) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role })
  const refreshToken = signRefreshToken({ sub: user._id.toString() })
  return { accessToken, refreshToken }
}

async function register({ name, email, password, role }) {
  const existing = await userRepository.findByEmail(email)
  if (existing) throw ApiError.conflict('An account with this email already exists')

  const safeRole = [ROLES.LISTENER, ROLES.HOST, ROLES.CREATOR].includes(role) ? role : ROLES.LISTENER

  const user = await userRepository.create({
    name, email, password, role: safeRole,
    handle: `@${email.split('@')[0]}${Math.floor(Math.random() * 1000)}`,
  })

  await walletRepository.getOrCreate(user._id)

  const verifyToken = generateRandomToken()
  await userRepository.updateById(user._id, { emailVerifyTokenHash: hashToken(verifyToken) })
  await emailService.sendVerificationEmail(user, verifyToken)
  await emailService.sendWelcomeEmail(user)

  return user.toPublicJSON()
}

async function issueSession(user, { userAgent = '', ip = '' } = {}) {
  const { accessToken, refreshToken } = buildAuthTokens(user)
  await sessionRepository.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent, ip,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  })
  await userRepository.updateById(user._id, { lastLoginAt: new Date() })
  return { accessToken, refreshToken }
}

async function login({ email, password }, meta) {
  const user = await userRepository.findByEmail(email, true)
  if (!user || !user.password) throw ApiError.unauthorized('Invalid email or password')
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked')

  const valid = await user.comparePassword(password)
  if (!valid) throw ApiError.unauthorized('Invalid email or password')

  const tokens = await issueSession(user, meta)
  return { user: user.toPublicJSON(), ...tokens }
}

async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing')

  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw ApiError.unauthorized('Refresh token invalid or expired')
  }

  const session = await sessionRepository.findValidByHash(hashToken(refreshToken))
  if (!session) throw ApiError.unauthorized('Session revoked — please log in again')

  const user = await userRepository.findById(payload.sub)
  if (!user || user.isDeleted || user.isBlocked) throw ApiError.unauthorized('Account unavailable')

  // Rotate: revoke the old session, issue a brand-new refresh token.
  session.revokedAt = new Date()
  await session.save()

  const tokens = await issueSession(user)
  return { user: user.toPublicJSON(), ...tokens }
}

async function logout(refreshToken) {
  if (!refreshToken) return
  const session = await sessionRepository.findValidByHash(hashToken(refreshToken))
  if (session) {
    session.revokedAt = new Date()
    await session.save()
  }
}

async function logoutAllDevices(userId) {
  await sessionRepository.revokeAllForUser(userId)
}

async function forgotPassword(email) {
  const user = await userRepository.findByEmail(email)
  if (!user) return // don't leak account existence
  const resetToken = generateRandomToken()
  await userRepository.updateById(user._id, {
    passwordResetTokenHash: hashToken(resetToken),
    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
  })
  await emailService.sendPasswordResetEmail(user, resetToken)
}

async function resetPassword(token, newPassword) {
  const user = await userRepository.model.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires')

  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired')

  user.password = newPassword
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  await user.save()
  await sessionRepository.revokeAllForUser(user._id)
}

async function verifyEmail(token) {
  const user = await userRepository.model
    .findOne({ emailVerifyTokenHash: hashToken(token) })
    .select('+emailVerifyTokenHash')

  if (!user) throw ApiError.badRequest('Verification link is invalid or has expired')

  user.isEmailVerified = true
  user.emailVerifyTokenHash = undefined
  await user.save()
  return user.toPublicJSON()
}

async function loginWithOAuthUser(user, meta) {
  const tokens = await issueSession(user, meta)
  return { user: user.toPublicJSON(), ...tokens }
}

module.exports = {
  register, login, refresh, logout, logoutAllDevices,
  forgotPassword, resetPassword, verifyEmail, loginWithOAuthUser,
}
