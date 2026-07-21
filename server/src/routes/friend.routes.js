const router = require('express').Router()
const friendController = require('../controllers/friend.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/friend.validation')

router.use(authenticate)

/**
 * @swagger
 * tags: [Friends]
 * /friends/requests:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Friend request sent }
 */
router.post('/requests', validate(v.sendRequest), friendController.send)
router.get('/requests', friendController.listIncoming)
router.post('/requests/:id/accept', friendController.accept)
router.post('/requests/:id/reject', friendController.reject)
router.get('/', friendController.listFriends)
router.delete('/:id', friendController.remove)

module.exports = router
