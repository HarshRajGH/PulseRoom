const ROLES = Object.freeze({
  ADMIN: 'admin',
  HOST: 'host',
  CREATOR: 'creator',
  LISTENER: 'listener',
})

const ROOM_PRIVACY = Object.freeze({ PUBLIC: 'public', PRIVATE: 'private' })

const REPORT_STATUS = Object.freeze({ PENDING: 'pending', RESOLVED: 'resolved', DISMISSED: 'dismissed' })

const REPORT_TARGET_TYPE = Object.freeze({ USER: 'user', ROOM: 'room', MESSAGE: 'message', SONG: 'song' })

const NOTIFICATION_TYPE = Object.freeze({
  VOTE: 'vote', FOLLOW: 'follow', ROOM: 'room', TIP: 'tip',
  PLAYLIST: 'playlist', SYSTEM: 'system', FRIEND_REQUEST: 'friend_request', MESSAGE: 'message',
})

const TRANSACTION_TYPE = Object.freeze({ TIP: 'tip', SUBSCRIPTION: 'subscription', WITHDRAWAL: 'withdrawal', REFUND: 'refund' })

const TRANSACTION_STATUS = Object.freeze({ PENDING: 'pending', COMPLETED: 'completed', FAILED: 'failed' })

const SUBSCRIPTION_PLAN = Object.freeze({ FREE: 'free', PREMIUM: 'premium', CREATOR: 'creator' })

const FRIEND_REQUEST_STATUS = Object.freeze({ PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected' })

module.exports = {
  ROLES, ROOM_PRIVACY, REPORT_STATUS, REPORT_TARGET_TYPE, NOTIFICATION_TYPE,
  TRANSACTION_TYPE, TRANSACTION_STATUS, SUBSCRIPTION_PLAN, FRIEND_REQUEST_STATUS,
}
