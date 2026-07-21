const router = require('express').Router()
const notificationController = require('../controllers/notification.controller')
const { authenticate } = require('../middlewares/auth.middleware')

router.use(authenticate)

/**
 * @swagger
 * tags: [Notifications]
 * /notifications:
 *   get:
 *     summary: List my notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated notification list with unread count }
 */
router.get('/', notificationController.list)
router.patch('/:id/read', notificationController.markRead)
router.patch('/read-all', notificationController.markAllRead)
router.delete('/:id', notificationController.remove)

module.exports = router
