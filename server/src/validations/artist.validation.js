const Joi = require('joi')

const createArtist = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  genre: Joi.string().allow(''),
  bio: Joi.string().max(500).allow(''),
  coverUrl: Joi.string().uri().allow(''),
})

module.exports = { createArtist }
