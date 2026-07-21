const router = require('express').Router()
const reportController = require('../controllers/report.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/report.validation')
const { ROLES } = require('../utils/constants')

/**
 * @swagger
 * tags: [Reports]
 * /reports:
 *   post:
 *     summary: Report a user, room, message, or song
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Report submitted }
 *   get:
 *     summary: List reports (admin only)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated report list }
 */
router.post('/', authenticate, validate(v.createReport), reportController.create)
router.get('/', authenticate, authorize(ROLES.ADMIN), reportController.list)
router.patch('/:id', authenticate, authorize(ROLES.ADMIN), validate(v.updateStatus), reportController.updateStatus)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), reportController.remove)

module.exports = router
