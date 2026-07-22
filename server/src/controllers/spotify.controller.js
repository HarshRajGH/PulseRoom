const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const spotifyService = require('../services/spotify.service')

/**
 * GET /spotify/liked-songs?page=&limit=
 * Returns the authenticated user's Spotify liked songs (paginated).
 */
const getLikedSongs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)
  const data = await spotifyService.getLikedSongs(req.user._id, { page, limit })
  res.json(new ApiResponse(200, data, 'Spotify liked songs'))
})

/**
 * GET /spotify/playlists?page=&limit=
 * Returns the authenticated user's Spotify playlists (paginated).
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)
  const data = await spotifyService.getUserPlaylists(req.user._id, { page, limit })
  res.json(new ApiResponse(200, data, 'Spotify playlists'))
})

/**
 * GET /spotify/playlists/:playlistId/tracks?page=&limit=
 * Returns tracks for a specific Spotify playlist.
 */
const getPlaylistTracks = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const page = parseInt(req.query.page, 10) || 1
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)
  const data = await spotifyService.getPlaylistTracks(req.user._id, playlistId, { page, limit })
  res.json(new ApiResponse(200, data, 'Spotify playlist tracks'))
})

/**
 * POST /spotify/import
 * Imports a Spotify track by creating a Song document and returning it.
 */
const importTrack = asyncHandler(async (req, res) => {
  const song = await spotifyService.importSpotifyTrack(req.user._id, req.body)
  res.json(new ApiResponse(201, song, 'Spotify track imported successfully'))
})

module.exports = { getLikedSongs, getUserPlaylists, getPlaylistTracks, importTrack }
