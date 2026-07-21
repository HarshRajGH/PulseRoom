const mongoose = require('mongoose')
const { REPORT_STATUS, REPORT_TARGET_TYPE } = require('../utils/constants')

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: Object.values(REPORT_TARGET_TYPE), required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 300 },
    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.PENDING },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String, default: '' },
  },
  { timestamps: true },
)

reportSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Report', reportSchema)
