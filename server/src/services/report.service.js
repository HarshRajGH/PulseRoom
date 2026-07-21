const ApiError = require('../utils/ApiError')
const reportRepository = require('../repositories/report.repository')
const auditLogRepository = require('../repositories/auditLog.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { REPORT_STATUS } = require('../utils/constants')

async function createReport(reporterId, { targetType, targetId, reason }) {
  return reportRepository.create({ reportedBy: reporterId, targetType, targetId, reason })
}

async function listReports(query) {
  const { page, limit, skip } = getPagination(query)
  const filter = query.status ? { status: query.status } : {}
  const [items, total] = await Promise.all([
    reportRepository.find(filter, { skip, limit, populate: ['reportedBy'] }),
    reportRepository.count(filter),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function updateStatus(id, adminId, status, resolutionNote = '') {
  if (!Object.values(REPORT_STATUS).includes(status)) throw ApiError.badRequest('Invalid status')
  const report = await reportRepository.updateById(id, { status, resolvedBy: adminId, resolutionNote })
  if (!report) throw ApiError.notFound('Report not found')
  await auditLogRepository.create({ actor: adminId, action: 'report.status_updated', targetType: 'Report', targetId: id, metadata: { status } })
  return report
}

async function deleteReport(id) {
  const report = await reportRepository.deleteById(id)
  if (!report) throw ApiError.notFound('Report not found')
}

module.exports = { createReport, listReports, updateStatus, deleteReport }
