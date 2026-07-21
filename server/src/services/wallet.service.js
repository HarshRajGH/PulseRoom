const ApiError = require('../utils/ApiError')
const walletRepository = require('../repositories/wallet.repository')
const transactionRepository = require('../repositories/transaction.repository')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { TRANSACTION_TYPE, TRANSACTION_STATUS } = require('../utils/constants')

async function getWallet(userId) {
  return walletRepository.getOrCreate(userId)
}

async function listTransactions(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const [items, total] = await Promise.all([
    transactionRepository.findByUser(userId, { skip, limit }),
    transactionRepository.count({ user: userId }),
  ])
  return buildPaginatedResponse(items, total, page, limit)
}

async function credit(userId, amount, type, note = '', meta = {}) {
  const wallet = await walletRepository.getOrCreate(userId)
  wallet.balance += amount
  wallet.totalEarned += amount
  await wallet.save()
  return transactionRepository.create({ user: userId, type, amount, note, meta, status: TRANSACTION_STATUS.COMPLETED })
}

async function withdraw(userId, amount) {
  const wallet = await walletRepository.getOrCreate(userId)
  if (wallet.balance < amount) throw ApiError.badRequest('Insufficient balance')

  wallet.balance -= amount
  wallet.totalWithdrawn += amount
  await wallet.save()

  return transactionRepository.create({
    user: userId, type: TRANSACTION_TYPE.WITHDRAWAL, amount: -amount,
    status: TRANSACTION_STATUS.COMPLETED, note: 'Withdrawal to linked payout method',
  })
}

module.exports = { getWallet, listTransactions, credit, withdraw }
