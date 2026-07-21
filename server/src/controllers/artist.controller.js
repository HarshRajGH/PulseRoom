const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const artistService = require('../services/artist.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await artistService.listArtists(req.query))))
const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await artistService.getArtist(req.params.id))))
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await artistService.createArtist(req.user._id, req.body), 'Artist created')))
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await artistService.updateArtist(req.params.id, req.body), 'Artist updated')))
const remove = asyncHandler(async (req, res) => { await artistService.deleteArtist(req.params.id); res.json(new ApiResponse(200, null, 'Artist deleted')) })

module.exports = { list, getOne, create, update, remove }
