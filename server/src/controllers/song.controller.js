const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const songService = require('../services/song.service')
const analyticsService = require('../services/analytics.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.listSongs(req.query))))
const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.getSong(req.params.id))))

const create = asyncHandler(async (req, res) => {
  const song = await songService.createSong(req.user._id, req.body, req.files)
  res.status(201).json(new ApiResponse(201, song, 'Song uploaded'))
})

const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await songService.updateSong(req.params.id, req.body), 'Song updated')))
const remove = asyncHandler(async (req, res) => { await songService.deleteSong(req.params.id); res.json(new ApiResponse(200, null, 'Song deleted')) })

const play = asyncHandler(async (req, res) => {
  const song = await songService.registerPlay(req.params.id)
  await analyticsService.recordEvent('platform', null, { listeningMinutes: 0 })
  res.json(new ApiResponse(200, song, 'Play registered'))
})

module.exports = { list, getOne, create, update, remove, play }
