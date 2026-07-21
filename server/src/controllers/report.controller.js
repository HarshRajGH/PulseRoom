const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const reportService = require('../services/report.service')

const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await reportService.createReport(req.user._id, req.body), 'Report submitted')))
const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await reportService.listReports(req.query))))
const updateStatus = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await reportService.updateStatus(req.params.id, req.user._id, req.body.status, req.body.resolutionNote), 'Report updated')))
const remove = asyncHandler(async (req, res) => { await reportService.deleteReport(req.params.id); res.json(new ApiResponse(200, null, 'Report deleted')) })

module.exports = { create, list, updateStatus, remove }
