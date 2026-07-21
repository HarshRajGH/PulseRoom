const ApiError = require('../utils/ApiError')

// Usage: authorize('admin', 'host')
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Authentication required'))
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'))
  }
  next()
}

module.exports = authorize
