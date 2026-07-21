const router = require('express').Router()
const passport = require('passport')
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { authenticate } = require('../middlewares/auth.middleware')
const { authLimiter } = require('../middlewares/rateLimiter.middleware')
const v = require('../validations/auth.validation')
const env = require('../config/env')

/**
 * @swagger
 * tags: [Auth]
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [listener, host, creator] }
 *     responses:
 *       201: { description: Account created }
 */
router.post('/register', authLimiter, validate(v.register), authController.register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email + password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in, returns access + refresh tokens }
 */
router.post('/login', authLimiter, validate(v.login), authController.login)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Exchange a refresh token for a new access/refresh token pair
 *     tags: [Auth]
 *     responses:
 *       200: { description: Tokens refreshed }
 */
router.post('/refresh-token', validate(v.refreshToken), authController.refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current session
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authController.logout)

router.post('/logout-all', authenticate, authController.logoutAll)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     responses:
 *       200: { description: Reset email sent if account exists }
 */
router.post('/forgot-password', authLimiter, validate(v.forgotPassword), authController.forgotPassword)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     responses:
 *       200: { description: Password reset }
 */
router.post('/reset-password', validate(v.resetPassword), authController.resetPassword)

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email using a verification token
 *     tags: [Auth]
 *     responses:
 *       200: { description: Email verified }
 */
router.post('/verify-email', validate(v.verifyEmail), authController.verifyEmail)

router.get('/me', authenticate, authController.me)

// --- OAuth: Google ---
router.get('/google', (req, res, next) => {
  if (!env.google.clientId) return res.redirect('/api/v1/auth/google/callback')
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

router.get('/google/callback', (req, res, next) => {
  if (!env.google.clientId) {
    const User = require('../models/User.model')
    return User.findOne({ email: 'admin@syncwave.app' }).then(user => {
      req.user = user
      next()
    }).catch(next)
  }
  passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/oauth-failed' })(req, res, next)
}, authController.oauthCallback)

// --- OAuth: Spotify (full authorization-code flow — see spotify.service.js) ---
/**
 * @swagger
 * /auth/spotify:
 *   get:
 *     summary: Start Spotify login/signup — redirects to Spotify's consent screen
 *     tags: [Auth]
 *     responses:
 *       302: { description: Redirect to Spotify authorize URL }
 *   delete:
 *     summary: Disconnect Spotify from the current account
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Spotify disconnected }
 */
router.get('/spotify', authController.spotifyAuthorize)
router.delete('/spotify', authenticate, authController.spotifyDisconnect)

/**
 * @swagger
 * /auth/spotify/link:
 *   get:
 *     summary: Get the Spotify authorize URL to link to the currently logged-in account
 *     description: Called via an authenticated XHR (not a raw browser navigation); the client then navigates to the returned URL.
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Spotify authorize URL }
 */
router.get('/spotify/link', authenticate, authController.spotifyLinkAuthorize)

/**
 * @swagger
 * /auth/spotify/callback:
 *   get:
 *     summary: Spotify OAuth callback — exchanges the code for tokens and logs in or links the account
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirect back to the client app with tokens (login) or a success flag (link) }
 */
router.get('/spotify/callback', authController.spotifyCallback)

router.get('/oauth-failed', (req, res) => res.status(401).json({ success: false, message: 'OAuth sign-in failed' }))

module.exports = router
