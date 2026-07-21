const router = require('express').Router()
const albumController = require('../controllers/album.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/album.validation')
const { ROLES } = require('../utils/constants')

router.get('/', albumController.list)
router.get('/:id', albumController.getOne)
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), validate(v.createAlbum), albumController.create)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), albumController.remove)

module.exports = router
