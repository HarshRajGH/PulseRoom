const Joi = require('joi')

const startConversation = Joi.object({
  userId: Joi.string().hex().length(24).required(),
})

const sendMessage = Joi.object({
  text: Joi.string().max(2000).allow(''),
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().allow(''),
      type: Joi.string().valid('image', 'file').required(),
      name: Joi.string().allow(''),
      size: Joi.number(),
    }),
  ).default([]),
}).or('text', 'attachments')

const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  q: Joi.string().max(200).allow(''),
})

module.exports = { startConversation, sendMessage, listQuery }
