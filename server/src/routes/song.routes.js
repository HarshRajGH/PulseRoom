const router = require('express').Router()
const songController = require('../controllers/song.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const multer = require('multer')
const v = require('../validations/song.validation')
const { ROLES } = require('../utils/constants')

const uploadFields = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])

/**
 * @swagger
 * tags: [Songs]
 * /songs:
 *   get:
 *     summary: List songs
 *     tags: [Songs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated song list }
 */
router.get('/', songController.list)
router.get('/:id', songController.getOne)
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), uploadFields, validate(v.createSong), songController.create)
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), validate(v.updateSong), songController.update)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), songController.remove)
// Liked songs (add/remove/list) now live under /library/liked — see library.routes.js
router.post('/:id/play', songController.play)

module.exports = router
