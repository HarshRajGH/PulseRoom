const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const adminService = require('../services/admin.service')

const dashboard = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await adminService.getDashboardStats())))
const auditLogs = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await adminService.listAuditLogs(req.query))))

module.exports = { dashboard, auditLogs }
