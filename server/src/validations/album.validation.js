const Joi = require('joi')

const createAlbum = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  artist: Joi.string().hex().length(24).required(),
  year: Joi.number().integer().min(1900).max(2100),
  coverUrl: Joi.string().uri().allow(''),
})

module.exports = { createAlbum }
