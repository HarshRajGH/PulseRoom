const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const subscriptionService = require('../services/subscription.service')
const paymentService = require('../services/payment.service')

const listPlans = asyncHandler(async (req, res) => res.json(new ApiResponse(200, subscriptionService.listPlans())))
const getMine = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await subscriptionService.getMySubscription(req.user._id))))
const subscribe = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await subscriptionService.subscribe(req.user._id, req.body.plan), 'Subscription created (mock checkout)')))
const cancel = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await subscriptionService.cancelSubscription(req.user._id), 'Subscription cancelled')))

const mockWebhook = asyncHandler(async (req, res) => {
  const event = paymentService.parseMockWebhookEvent(req.body)
  res.json(new ApiResponse(200, event, 'Mock webhook received'))
})

module.exports = { listPlans, getMine, subscribe, cancel, mockWebhook }
