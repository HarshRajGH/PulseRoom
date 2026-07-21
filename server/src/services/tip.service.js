const ApiError = require('../utils/ApiError')
const tipRepository = require('../repositories/tip.repository')
const walletService = require('./wallet.service')
const notificationService = require('./notification.service')
const userRepository = require('../repositories/user.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { TRANSACTION_TYPE, NOTIFICATION_TYPE } = require('../utils/constants')

async function sendTip(fromId, toId, amount, note, roomId) {
  if (fromId.toString() === toId.toString()) throw ApiError.badRequest("You can't tip yourself")
  if (amount < 1) throw ApiError.badRequest('Tip amount must be at least 1')

  const transaction = await walletService.credit(toId, amount, TRANSACTION_TYPE.TIP, note, { from: fromId, room: roomId })
  const tip = await tipRepository.create({ from: fromId, to: toId, room: roomId, amount, note, transaction: transaction._id })

  const sender = await userRepository.findById(fromId)
  await notificationService.createNotification(toId, NOTIFICATION_TYPE.TIP, `${sender.name} tipped you ₹${amount}${note ? ` — "${note}"` : ''}`, { tipId: tip._id })

  return tip
}

async function listReceived(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total] = await Promise.all([
    tipRepository.findReceivedBy(userId, { skip, limit }),
    tipRepository.count({ to: userId }),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

module.exports = { sendTip, listReceived }
