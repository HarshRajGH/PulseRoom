const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const songService = require('../services/song.service')
const analyticsService = require('../services/analytics.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.listSongs(req.query, req.user))))
const listPending = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.listPendingSongs(req.query))))
const listMine = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.listMySongs(req.user._id, req.query))))

const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.getSong(req.params.id))))

const create = asyncHandler(async (req, res) => {
  const song = await songService.createSong(req.user._id, req.body, req.files)
  res.status(201).json(new ApiResponse(201, song, 'Song uploaded successfully and is pending verification.'))
})

const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.updateSong(req.params.id, req.user._id, req.user.role, req.body), 'Song updated')))
const remove = asyncHandler(async (req, res) => { await songService.deleteSong(req.params.id, req.user._id, req.user.role); res.json(new ApiResponse(200, null, 'Song deleted')) })

const verify = asyncHandler(async (req, res) => {
  const song = await songService.verifySong(req.user._id, req.params.id, req.body)
  res.json(new ApiResponse(200, song, `Song ${req.body.status}`))
})

const play = asyncHandler(async (req, res) => {
  const song = await songService.registerPlay(req.params.id)
  await analyticsService.recordEvent('platform', null, { listeningMinutes: 0 })
  res.json(new ApiResponse(200, song, 'Play registered'))
})

const searchYoutube = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json(new ApiResponse(400, null, 'Query parameter q is required'))
  const videoId = await songService.searchYoutubeVideo(q)
  res.json(new ApiResponse(200, { videoId }, 'YouTube video ID found'))
})

module.exports = { list, listPending, listMine, getOne, create, update, remove, verify, play, searchYoutube }
