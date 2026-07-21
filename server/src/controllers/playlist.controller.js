const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const playlistService = require('../services/playlist.service')

const listMine = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.listMyPlaylists(req.user._id, req.query))))
const getOne = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.getPlaylist(req.params.id))))
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await playlistService.createPlaylist(req.user._id, req.body), 'Playlist created')))
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.updatePlaylist(req.params.id, req.user._id, req.body), 'Playlist updated')))
const remove = asyncHandler(async (req, res) => { await playlistService.deletePlaylist(req.params.id, req.user._id); res.json(new ApiResponse(200, null, 'Playlist deleted')) })
const addTrack = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.addTrack(req.params.id, req.user._id, req.body.songId), 'Track added')))
const removeTrack = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.removeTrack(req.params.id, req.user._id, req.params.songId), 'Track removed')))
const toggleFollow = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await playlistService.toggleFollow(req.params.id, req.user._id), 'Follow toggled')))

module.exports = { listMine, getOne, create, update, remove, addTrack, removeTrack, toggleFollow }
