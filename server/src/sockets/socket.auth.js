const { verifyAccessToken } = require('../utils/tokens')
const userRepository = require('../repositories/user.repository')

// Socket.io middleware — expects the access token on `socket.handshake.auth.token`.
async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    if (!token) return next(new Error('Authentication token missing'))

    const payload = verifyAccessToken(token)
    const user = await userRepository.findById(payload.sub)
    if (!user || user.isDeleted || user.isBlocked) return next(new Error('Account unavailable'))

    socket.user = user
    next()
  } catch {
    next(new Error('Invalid or expired token'))
  }
}

module.exports = socketAuthMiddleware
