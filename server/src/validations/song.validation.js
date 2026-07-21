const Joi = require('joi')

const createSong = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().hex().length(24).required(),
  album: Joi.string().hex().length(24).allow('', null),
  genre: Joi.string().allow(''),
  duration: Joi.number().integer().min(1).required(),
})

const updateSong = Joi.object({
  title: Joi.string(),
  genre: Joi.string().allow(''),
  duration: Joi.number().integer().min(1),
})

module.exports = { createSong, updateSong }
