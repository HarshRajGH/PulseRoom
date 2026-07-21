const analyticsService = require('./analytics.service')
const auditLogRepository = require('../repositories/auditLog.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { Room, Report } = require('../models')

async function getDashboardStats() {
  const [overview, activeRoomsCount, openReports] = await Promise.all([
    analyticsService.getPlatformOverview(),
    Room.countDocuments({ isLive: true }),
    Report.countDocuments({ status: 'pending' }),
  ])
  return { ...overview, activeRoomsCount, openReports }
}

async function listAuditLogs(query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total] = await Promise.all([
    auditLogRepository.find({}, { skip, limit, populate: ['actor'] }),
    auditLogRepository.count({}),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

module.exports = { getDashboardStats, listAuditLogs }
