const router = require('express').Router()
const libraryController = require('../controllers/library.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/library.validation')

router.use(authenticate)

/**
 * @swagger
 * tags: [Library]
 * /library/liked:
 *   get:
 *     summary: List the current user's liked songs (paginated, sortable, searchable)
 *     tags: [Library]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [recent, oldest, title, plays] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Full-text search within liked songs (title/genre)
 *     responses:
 *       200: { description: Paginated liked-songs list }
 */
router.get('/liked', validate(v.listLiked, 'query'), libraryController.listLiked)

/**
 * @swagger
 * /library/liked/{songId}:
 *   post:
 *     summary: Add a song to the current user's liked songs
 *     tags: [Library]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Song added to liked songs }
 *   delete:
 *     summary: Remove a song from the current user's liked songs
 *     tags: [Library]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Song removed from liked songs }
 */
router.post('/liked/:songId', libraryController.like)
router.delete('/liked/:songId', libraryController.unlike)

module.exports = router
