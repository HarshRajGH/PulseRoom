const Joi = require('joi')

const withdraw = Joi.object({ amount: Joi.number().positive().required() })

const sendTip = Joi.object({
  toUserId: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  note: Joi.string().max(200).allow(''),
  roomId: Joi.string().hex().length(24).allow(null, ''),
})

module.exports = { withdraw, sendTip }
