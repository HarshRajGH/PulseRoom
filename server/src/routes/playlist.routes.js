const router = require('express').Router()
const playlistController = require('../controllers/playlist.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/playlist.validation')

/**
 * @swagger
 * tags: [Playlists]
 * /playlists:
 *   get:
 *     summary: List my playlists
 *     tags: [Playlists]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated playlist list }
 *   post:
 *     summary: Create a playlist
 *     tags: [Playlists]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Playlist created }
 */
router.get('/', authenticate, playlistController.listMine)
router.post('/', authenticate, validate(v.createPlaylist), playlistController.create)
router.get('/:id', playlistController.getOne)
router.patch('/:id', authenticate, validate(v.updatePlaylist), playlistController.update)
router.delete('/:id', authenticate, playlistController.remove)
router.post('/:id/tracks', authenticate, validate(v.addTrack), playlistController.addTrack)
router.delete('/:id/tracks/:songId', authenticate, playlistController.removeTrack)
router.post('/:id/follow', authenticate, playlistController.toggleFollow)

module.exports = router
