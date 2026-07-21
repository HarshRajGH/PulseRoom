const router = require('express').Router()
const searchController = require('../controllers/search.controller')

/**
 * @swagger
 * tags: [Search]
 * /search:
 *   get:
 *     summary: Global search across songs, rooms, playlists, and users
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Grouped search results }
 */
router.get('/', searchController.search)

module.exports = router
