const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const { ROLES } = require('../utils/constants')

router.use(authenticate, authorize(ROLES.ADMIN))

/**
 * @swagger
 * tags: [Admin]
 * /admin/dashboard:
 *   get:
 *     summary: Platform-wide admin dashboard stats
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard stats }
 */
router.get('/dashboard', adminController.dashboard)
router.get('/audit-logs', adminController.auditLogs)

module.exports = router
