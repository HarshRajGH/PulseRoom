const router = require('express').Router()
const userController = require('../controllers/user.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const validate = require('../middlewares/validate.middleware')
const { imageUpload } = require('../middlewares/upload.middleware')
const v = require('../validations/user.validation')
const { ROLES } = require('../utils/constants')

/**
 * @swagger
 * tags: [Users]
 * /users:
 *   get:
 *     summary: List users (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/', authenticate, authorize(ROLES.ADMIN), userController.listUsers)

router.get('/:id', authenticate, userController.getUserById)
router.patch('/me', authenticate, validate(v.updateProfile), userController.updateProfile)
router.patch('/me/password', authenticate, validate(v.changePassword), userController.changePassword)
router.post('/me/avatar', authenticate, imageUpload.single('avatar'), userController.uploadAvatar)

router.patch('/:id/role', authenticate, authorize(ROLES.ADMIN), validate(v.updateRole), userController.updateUserRole)
router.patch('/:id/block', authenticate, authorize(ROLES.ADMIN), userController.blockUser)
router.patch('/:id/unblock', authenticate, authorize(ROLES.ADMIN), userController.unblockUser)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), userController.deleteUser)

router.post('/:id/follow', authenticate, userController.follow)
router.delete('/:id/follow', authenticate, userController.unfollow)
router.post('/:id/block', authenticate, userController.blockAsUser)
router.delete('/:id/block', authenticate, userController.unblockAsUser)

module.exports = router
