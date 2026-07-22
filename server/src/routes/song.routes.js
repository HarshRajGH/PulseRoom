const router = require('express').Router()
const songController = require('../controllers/song.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const { uploadLimiter } = require('../middlewares/rateLimiter.middleware')
const multer = require('multer')
const v = require('../validations/song.validation')
const { ROLES } = require('../utils/constants')

const uploadFields = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])

router.get('/', songController.list)
router.get('/pending', authenticate, authorize(ROLES.ADMIN), songController.listPending)
router.get('/mine', authenticate, songController.listMine)
router.get('/search-yt', authenticate, songController.searchYoutube)
router.get('/:id', songController.getOne)

router.post('/', authenticate, uploadLimiter, uploadFields, validate(v.createSong), songController.create)
router.patch('/:id', authenticate, validate(v.updateSong), songController.update)
router.delete('/:id', authenticate, songController.remove)

router.patch('/:id/verify', authenticate, authorize(ROLES.ADMIN), validate(v.verifySong), songController.verify)
router.post('/:id/play', songController.play)

module.exports = router
