const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { verifyAccessToken } = require('../utils/tokens')
const userRepository = require('../repositories/user.repository')

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken

  if (!token) throw ApiError.unauthorized('Access token missing')

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw ApiError.unauthorized('Access token invalid or expired')
  }

  const user = await userRepository.findById(payload.sub)
  if (!user || user.isDeleted) throw ApiError.unauthorized('Account no longer exists')
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked')

  req.user = user
  next()
})

// Attaches req.user if a valid token is present, but never rejects the
// request — used on public routes that behave slightly differently for
// logged-in users (e.g. showing "liked" state).
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken
  if (!token) return next()
  try {
    const payload = verifyAccessToken(token)
    const user = await userRepository.findById(payload.sub)
    if (user && !user.isDeleted && !user.isBlocked) req.user = user
  } catch {
    // ignore invalid token on optional routes
  }
  next()
})

module.exports = { authenticate, optionalAuthenticate }
