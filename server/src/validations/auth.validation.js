const Joi = require('joi')

const register = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('listener', 'host', 'creator'),
})

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const forgotPassword = Joi.object({ email: Joi.string().email().required() })

const resetPassword = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
})

const verifyEmail = Joi.object({ token: Joi.string().required() })

const refreshToken = Joi.object({ refreshToken: Joi.string().optional() })

module.exports = { register, login, forgotPassword, resetPassword, verifyEmail, refreshToken }
