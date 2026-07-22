const Joi = require('joi')

const createSong = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().required(), // Free text artist name
  album: Joi.string().hex().length(24).allow('', null),
  genre: Joi.string().allow(''),
})

const updateSong = Joi.object({
  title: Joi.string(),
  genre: Joi.string().allow(''),
})

const verifySong = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().allow('', null).when('status', { is: 'rejected', then: Joi.required() }),
})

module.exports = { createSong, updateSong, verifySong }
