const router = require('express').Router()
const spotifyController = require('../controllers/spotify.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// All Spotify library routes require the user to be authenticated AND
// have their Spotify account linked (the service layer checks spotifyConnected).

/**
 * @swagger
 * tags: [Spotify]
 * /spotify/liked-songs:
 *   get:
 *     summary: Get the current user's Spotify liked songs
 *     tags: [Spotify]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: Paginated liked songs }
 *       400: { description: Spotify not connected }
 */
router.get('/liked-songs', authenticate, spotifyController.getLikedSongs)

/**
 * @swagger
 * /spotify/playlists:
 *   get:
 *     summary: Get the current user's Spotify playlists
 *     tags: [Spotify]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: Paginated playlists }
 */
router.get('/playlists', authenticate, spotifyController.getUserPlaylists)

/**
 * @swagger
 * /spotify/playlists/{playlistId}/tracks:
 *   get:
 *     summary: Get tracks from a specific Spotify playlist
 *     tags: [Spotify]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: Paginated playlist tracks }
 */
router.get('/playlists/:playlistId/tracks', authenticate, spotifyController.getPlaylistTracks)
router.post('/import', authenticate, spotifyController.importTrack)

module.exports = router
