const Joi = require('joi')

const sendRequest = Joi.object({ toUserId: Joi.string().hex().length(24).required() })

module.exports = { sendRequest }
