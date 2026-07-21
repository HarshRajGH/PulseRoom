const router = require('express').Router()
const analyticsController = require('../controllers/analytics.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const { ROLES } = require('../utils/constants')

/**
 * @swagger
 * tags: [Analytics]
 * /analytics/me:
 *   get:
 *     summary: Get my listening/creator analytics
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Daily analytics rollups }
 */
router.get('/me', authenticate, analyticsController.myAnalytics)
router.get('/rooms/:roomId', authenticate, analyticsController.roomAnalytics)
router.get('/platform', authenticate, authorize(ROLES.ADMIN), analyticsController.platformOverview)

module.exports = router
