const Joi = require('joi')

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(60),
  handle: Joi.string().min(2).max(30).pattern(/^@?[a-zA-Z0-9_]+$/),
  bio: Joi.string().max(280).allow(''),
})

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
})

const updateRole = Joi.object({
  role: Joi.string().valid('admin', 'host', 'creator', 'listener').required(),
})

const idParam = Joi.object({ id: Joi.string().hex().length(24).required() })

module.exports = { updateProfile, changePassword, updateRole, idParam }
