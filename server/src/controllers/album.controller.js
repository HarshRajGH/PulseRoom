const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const albumService = require('../services/album.service')

const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await albumService.listAlbums(req.query))))
const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await albumService.getAlbum(req.params.id))))
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await albumService.createAlbum(req.user._id, req.body), 'Album created')))
const remove = asyncHandler(async (req, res) => { await albumService.deleteAlbum(req.params.id); res.json(new ApiResponse(200, null, 'Album deleted')) })

module.exports = { list, getOne, create, remove }
