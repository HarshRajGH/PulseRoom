const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const passport = require('passport')
const swaggerUi = require('swagger-ui-express')

const env = require('./config/env')
const logger = require('./config/logger')
const swaggerSpec = require('./config/swagger')
require('./config/passport')

const routes = require('./routes')
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware')
const { apiLimiter } = require('./middlewares/rateLimiter.middleware')

const app = express()

app.set('trust proxy', 1)

// --- Security & core middleware ---
app.use(helmet())
app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(passport.initialize())

app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
)

app.use('/api', apiLimiter)

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

// --- Swagger docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'SyncWave API Docs' }))
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec))

// --- API routes ---
app.use('/api/v1', routes)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'SyncWave API — see /api-docs for documentation.' })
})

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
// Trigger restart
