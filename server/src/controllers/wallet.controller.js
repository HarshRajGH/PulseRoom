const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const walletService = require('../services/wallet.service')
const tipService = require('../services/tip.service')

const getWallet = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await walletService.getWallet(req.user._id))))
const listTransactions = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await walletService.listTransactions(req.user._id, req.query))))
const withdraw = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await walletService.withdraw(req.user._id, req.body.amount), 'Withdrawal processed')))

const sendTip = asyncHandler(async (req, res) => {
  const tip = await tipService.sendTip(req.user._id, req.body.toUserId, req.body.amount, req.body.note, req.body.roomId)
  res.status(201).json(new ApiResponse(201, tip, 'Tip sent'))
})

const listTipsReceived = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await tipService.listReceived(req.user._id, req.query))))

module.exports = { getWallet, listTransactions, withdraw, sendTip, listTipsReceived }
