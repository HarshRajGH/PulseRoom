const BaseRepository = require('./BaseRepository')
const { AuditLog } = require('../models')

class AuditLogRepository extends BaseRepository {
  constructor() { super(AuditLog) }
}

module.exports = new AuditLogRepository()
