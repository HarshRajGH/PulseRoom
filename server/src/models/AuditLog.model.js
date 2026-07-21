const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true },
)

auditLogSchema.index({ actor: 1, createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
