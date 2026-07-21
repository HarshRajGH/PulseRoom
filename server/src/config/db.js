const mongoose = require('mongoose')
const env = require('./env')
const logger = require('./logger')

async function connectDB() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.mongoUri)
    logger.info(`MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`)
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))
  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`))
}

module.exports = connectDB
