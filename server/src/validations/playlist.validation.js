const Joi = require('joi')

const createPlaylist = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  description: Joi.string().max(300).allow(''),
  isCollaborative: Joi.boolean(),
  isPublic: Joi.boolean(),
  coverUrl: Joi.string().uri().allow(''),
})

const updatePlaylist = Joi.object({
  name: Joi.string().min(1).max(80),
  description: Joi.string().max(300).allow(''),
  isCollaborative: Joi.boolean(),
  isPublic: Joi.boolean(),
  coverUrl: Joi.string().uri().allow(''),
})

const addTrack = Joi.object({ songId: Joi.string().hex().length(24).required() })

module.exports = { createPlaylist, updatePlaylist, addTrack }
