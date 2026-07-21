const router = require('express').Router()
const recommendationController = require('../controllers/recommendation.controller')
const { authenticate } = require('../middlewares/auth.middleware')

/**
 * @swagger
 * tags: [Recommendations]
 * /recommendations/songs:
 *   get:
 *     summary: Get personalized song recommendations
 *     tags: [Recommendations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Recommended songs }
 */
router.get('/songs', authenticate, recommendationController.songs)
router.get('/rooms', recommendationController.rooms)

module.exports = router
