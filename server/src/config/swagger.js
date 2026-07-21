const swaggerJSDoc = require('swagger-jsdoc')
const path = require('path')
const env = require('./env')

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SyncWave API',
      version: '1.0.0',
      description:
        'REST API for SyncWave — collaborative playlists and live listening parties. ' +
        'MVC + Repository + Service layered architecture, JWT auth with refresh tokens, ' +
        'role-based access (admin, host, creator, listener), and Socket.io real-time events.',
      contact: { name: 'SyncWave API Support', email: 'support@syncwave.app' },
    },
    servers: [
      { url: `http://localhost:${env.port}/api/v1`, description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
}

module.exports = swaggerJSDoc(options)
