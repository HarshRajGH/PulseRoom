const mongoose = require('mongoose')

const tipSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, maxlength: 200, default: '' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Tip', tipSchema)
