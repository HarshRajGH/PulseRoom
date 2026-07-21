const winston = require('winston')
require('winston-daily-rotate-file')
const path = require('path')
const env = require('./env')

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `[${ts}] ${level}: ${stack || message}`),
)

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp(), errors({ stack: true }), json()),
})

const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    fileRotateTransport,
  ],
  exitOnError: false,
})

module.exports = logger
