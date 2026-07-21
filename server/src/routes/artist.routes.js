const router = require('express').Router()
const artistController = require('../controllers/artist.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/artist.validation')
const { ROLES } = require('../utils/constants')

/**
 * @swagger
 * tags: [Artists]
 * /artists:
 *   get:
 *     summary: List artists
 *     tags: [Artists]
 *     responses:
 *       200: { description: Paginated artist list }
 */
router.get('/', artistController.list)
router.get('/:id', artistController.getOne)
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), validate(v.createArtist), artistController.create)
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.CREATOR), artistController.update)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), artistController.remove)

module.exports = router
