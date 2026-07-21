const router = require('express').Router()
const privacySettingsController = require('../controllers/privacySettings.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/privacySettings.validation')

router.use(authenticate)

/**
 * @swagger
 * tags: [Privacy]
 * /privacy/me:
 *   get:
 *     summary: Get my privacy settings (created with defaults on first access)
 *     tags: [Privacy]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Privacy settings }
 *   patch:
 *     summary: Update my privacy settings — persists to MongoDB, survives refresh and other devices
 *     tags: [Privacy]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPrivateAccount: { type: boolean }
 *               hideListeningActivity: { type: boolean }
 *               allowFriendRequests: { type: boolean }
 *               allowRoomInvites: { type: boolean }
 *               showOnlineStatus: { type: boolean }
 *               profileVisibility: { type: string, enum: [public, friends, private] }
 *               messagePermissions: { type: string, enum: [everyone, friends, none] }
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   email: { type: boolean }
 *                   push: { type: boolean }
 *                   tips: { type: boolean }
 *                   mentions: { type: boolean }
 *     responses:
 *       200: { description: Updated privacy settings }
 */
router.get('/me', privacySettingsController.getMine)
router.patch('/me', validate(v.updatePrivacy), privacySettingsController.updateMine)

module.exports = router
