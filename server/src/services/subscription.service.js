const ApiError = require('../utils/ApiError')
const subscriptionRepository = require('../repositories/subscription.repository')
const userRepository = require('../repositories/user.repository')
const paymentService = require('./payment.service')
const { SUBSCRIPTION_PLAN } = require('../utils/constants')

const PLAN_PRICES = {
  [SUBSCRIPTION_PLAN.FREE]: 0,
  [SUBSCRIPTION_PLAN.PREMIUM]: 149,
  [SUBSCRIPTION_PLAN.CREATOR]: 349,
}

function listPlans() {
  return Object.entries(PLAN_PRICES).map(([plan, priceMonthly]) => ({ plan, priceMonthly }))
}

async function getMySubscription(userId) {
  return subscriptionRepository.findActiveByUser(userId)
}

async function subscribe(userId, plan) {
  if (!(plan in PLAN_PRICES)) throw ApiError.badRequest('Unknown plan')

  const existing = await subscriptionRepository.findActiveByUser(userId)
  if (existing) {
    existing.isActive = false
    existing.cancelledAt = new Date()
    await existing.save()
  }

  const checkout = await paymentService.createMockCheckoutSession({ userId, plan, amount: PLAN_PRICES[plan] })

  const subscription = await subscriptionRepository.create({
    user: userId,
    plan,
    priceMonthly: PLAN_PRICES[plan],
    renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stripeMockId: checkout.id,
  })

  await userRepository.updateById(userId, { plan })
  return { subscription, checkout }
}

async function cancelSubscription(userId) {
  const subscription = await subscriptionRepository.findActiveByUser(userId)
  if (!subscription) throw ApiError.notFound('No active subscription found')
  subscription.isActive = false
  subscription.cancelledAt = new Date()
  await subscription.save()
  await userRepository.updateById(userId, { plan: SUBSCRIPTION_PLAN.FREE })
  return subscription
}

module.exports = { listPlans, getMySubscription, subscribe, cancelSubscription }
