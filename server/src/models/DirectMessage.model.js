const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    type: { type: String, enum: ['image', 'file'], required: true },
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false },
)

const directMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 2000, default: '' },
    attachments: [attachmentSchema],
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

directMessageSchema.index({ conversation: 1, createdAt: -1 })
directMessageSchema.index({ recipient: 1, status: 1 })
directMessageSchema.index({ text: 'text' })

module.exports = mongoose.model('DirectMessage', directMessageSchema)
