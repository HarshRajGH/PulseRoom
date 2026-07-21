const mongoose = require('mongoose')
const ApiError = require('../utils/ApiError')
const logger = require('../config/logger')
const env = require('../config/env')

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err

  if (!(error instanceof ApiError)) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message)
      error = ApiError.badRequest('Validation failed', errors)
    } else if (error instanceof mongoose.Error.CastError) {
      error = ApiError.badRequest(`Invalid value for ${error.path}`)
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0]
      error = ApiError.conflict(`${field ? `${field} already in use` : 'Duplicate value'}`)
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Internal server error')
    }
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${error.message}`, { stack: err.stack })
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message,
    errors: error.errors || [],
    ...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
  })
}

module.exports = { notFoundHandler, errorHandler }
