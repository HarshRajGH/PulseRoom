const Joi = require('joi')

const subscribe = Joi.object({
  plan: Joi.string().valid('free', 'premium', 'creator').required(),
})

module.exports = { subscribe }
