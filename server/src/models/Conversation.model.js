const mongoose = require('mongoose')

// One-to-one conversations. `participants` always has exactly 2 users;
// modeled as an array (rather than userA/userB fields) so lookups like
// "find the conversation containing user X" stay a simple $in query.
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage' },
    lastMessageAt: { type: Date, default: Date.now },
    // Per-user soft delete: a deleted conversation disappears from that
    // user's inbox but still exists (and reappears) for the other party,
    // and reappears for the deleter too if a new message arrives.
    deletedFor: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deletedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })

module.exports = mongoose.model('Conversation', conversationSchema)
