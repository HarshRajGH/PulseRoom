const router = require('express').Router()
const roomController = require('../controllers/room.controller')
const queueController = require('../controllers/queue.controller')
const messageController = require('../controllers/message.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const roomV = require('../validations/room.validation')
const messageV = require('../validations/message.validation')

/**
 * @swagger
 * tags: [Rooms]
 * /rooms:
 *   get:
 *     summary: List live/public rooms
 *     tags: [Rooms]
 *     responses:
 *       200: { description: Paginated room list }
 *   post:
 *     summary: Create a room
 *     tags: [Rooms]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Room created }
 */
router.get('/', roomController.list)
router.post('/', authenticate, validate(roomV.createRoom), roomController.create)
router.get('/:id', roomController.getOne)
router.patch('/:id', authenticate, validate(roomV.updateRoom), roomController.update)
router.post('/:id/end', authenticate, roomController.end)
router.post('/:id/join', authenticate, roomController.join)
router.post('/:id/leave', authenticate, roomController.leave)

// Queue / voting
router.get('/:id/queue', roomController.getQueue)
router.post('/:roomId/queue', authenticate, validate(roomV.queueSong), queueController.addToQueue)
router.post('/queue/:voteId/upvote', authenticate, queueController.upvote)
router.delete('/queue/:voteId', authenticate, queueController.removeFromQueue)

// Chat
router.get('/:roomId/messages', messageController.list)
router.post('/:roomId/messages', authenticate, validate(messageV.postMessage), messageController.create)
router.delete('/messages/:id', authenticate, messageController.remove)

module.exports = router
