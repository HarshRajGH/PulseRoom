const Joi = require('joi')

const postMessage = Joi.object({ text: Joi.string().min(1).max(500).required() })

module.exports = { postMessage }
