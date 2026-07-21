const Joi = require('joi')

const createReport = Joi.object({
  targetType: Joi.string().valid('user', 'room', 'message', 'song').required(),
  targetId: Joi.string().hex().length(24).required(),
  reason: Joi.string().min(3).max(300).required(),
})

const updateStatus = Joi.object({
  status: Joi.string().valid('pending', 'resolved', 'dismissed').required(),
  resolutionNote: Joi.string().max(500).allow(''),
})

module.exports = { createReport, updateStatus }
