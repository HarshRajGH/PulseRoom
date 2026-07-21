const router = require('express').Router()
const conversationController = require('../controllers/conversation.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { attachmentUpload } = require('../middlewares/upload.middleware')
const v = require('../validations/conversation.validation')

router.use(authenticate)

/**
 * @swagger
 * tags: [Direct Messages]
 * /conversations:
 *   get:
 *     summary: List my conversations (paginated; pass q to search by participant name/handle)
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated conversation list, newest first }
 *   post:
 *     summary: Start (or fetch existing) one-to-one conversation with a user
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [userId], properties: { userId: { type: string } } }
 *     responses:
 *       201: { description: Conversation created or fetched }
 */
router.get('/', validate(v.listQuery, 'query'), conversationController.list)
router.post('/', validate(v.startConversation), conversationController.start)

router.get('/unread-count', conversationController.unreadCount)

/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get a single conversation
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Conversation details }
 *   delete:
 *     summary: Soft-delete a conversation from my inbox (reappears if a new message arrives)
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Conversation removed from inbox }
 */
router.get('/:id', conversationController.getOne)
router.delete('/:id', conversationController.remove)

/**
 * @swagger
 * /conversations/{id}/messages:
 *   get:
 *     summary: Get message history for a conversation (paginated; pass q to search message text)
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated messages, oldest to newest within the page }
 *   post:
 *     summary: Send a direct message (text and/or attachments)
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Message sent }
 */
router.get('/:id/messages', validate(v.listQuery, 'query'), conversationController.getMessages)
router.post('/:id/messages', validate(v.sendMessage), conversationController.postMessage)

router.patch('/:id/read', conversationController.markRead)
router.delete('/:id/messages/:messageId', conversationController.deleteMessage)

/**
 * @swagger
 * /conversations/attachments:
 *   post:
 *     summary: Upload a DM attachment (image or file) — returns metadata to include in a subsequent send-message call
 *     tags: [Direct Messages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema: { type: object, properties: { file: { type: string, format: binary } } }
 *     responses:
 *       201: { description: Attachment uploaded to Cloudinary }
 */
router.post('/attachments', attachmentUpload.single('file'), conversationController.uploadAttachment)

module.exports = router
