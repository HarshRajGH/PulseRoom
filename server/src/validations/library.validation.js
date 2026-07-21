const Joi = require('joi')

const listLiked = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().valid('recent', 'oldest', 'title', 'plays'),
  q: Joi.string().max(100).allow(''),
})

module.exports = { listLiked }
