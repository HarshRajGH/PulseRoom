const router = require('express').Router()
const walletController = require('../controllers/wallet.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const v = require('../validations/wallet.validation')

router.use(authenticate)

/**
 * @swagger
 * tags: [Wallet]
 * /wallet:
 *   get:
 *     summary: Get my wallet balance
 *     tags: [Wallet]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet details }
 */
router.get('/', walletController.getWallet)
router.get('/transactions', walletController.listTransactions)
router.post('/withdraw', validate(v.withdraw), walletController.withdraw)
router.post('/tips', validate(v.sendTip), walletController.sendTip)
router.get('/tips/received', walletController.listTipsReceived)

module.exports = router
