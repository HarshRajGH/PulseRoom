const mongoose = require('mongoose')
const { SUBSCRIPTION_PLAN } = require('../utils/constants')

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: Object.values(SUBSCRIPTION_PLAN), required: true },
    priceMonthly: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
    renewsAt: { type: Date },
    cancelledAt: { type: Date },
    isActive: { type: Boolean, default: true },
    stripeMockId: { type: String },
  },
  { timestamps: true },
)

subscriptionSchema.index({ user: 1, isActive: 1 })

module.exports = mongoose.model('Subscription', subscriptionSchema)
