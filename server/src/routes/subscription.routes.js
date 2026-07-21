const router = require('express').Router()
const subscriptionController = require('../controllers/subscription.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/subscription.validation')

/**
 * @swagger
 * tags: [Subscriptions]
 * /subscriptions/plans:
 *   get:
 *     summary: List available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: Plan list }
 */
router.get('/plans', subscriptionController.listPlans)
router.get('/me', authenticate, subscriptionController.getMine)
router.post('/subscribe', authenticate, validate(v.subscribe), subscriptionController.subscribe)
router.post('/cancel', authenticate, subscriptionController.cancel)
router.post('/webhook/mock', subscriptionController.mockWebhook)

module.exports = router
