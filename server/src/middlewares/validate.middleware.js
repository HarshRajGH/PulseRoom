const ApiError = require('../utils/ApiError')

// Wraps a Joi schema. Usage: validate(schema, 'body' | 'query' | 'params')
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true })
  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, ''))
    return next(ApiError.badRequest('Validation failed', errors))
  }
  req[property] = value
  next()
}

module.exports = validate
