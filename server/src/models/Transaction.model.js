const mongoose = require('mongoose')
const { TRANSACTION_TYPE, TRANSACTION_STATUS } = require('../utils/constants')

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(TRANSACTION_TYPE), required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.COMPLETED },
    reference: { type: String },
    note: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

transactionSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Transaction', transactionSchema)
