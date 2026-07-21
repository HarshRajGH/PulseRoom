const Joi = require('joi')

const createRoom = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  description: Joi.string().max(300).allow(''),
  genre: Joi.string().allow(''),
  mood: Joi.string().allow(''),
  privacy: Joi.string().valid('public', 'private').default('public'),
  coverUrl: Joi.string().uri().allow(''),
})

const updateRoom = Joi.object({
  name: Joi.string().min(2).max(60),
  description: Joi.string().max(300).allow(''),
  genre: Joi.string().allow(''),
  mood: Joi.string().allow(''),
  coverUrl: Joi.string().uri().allow(''),
})

const queueSong = Joi.object({ songId: Joi.string().hex().length(24).required() })

module.exports = { createRoom, updateRoom, queueSong }
