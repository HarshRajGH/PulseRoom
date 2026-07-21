const { v4: uuid } = require('uuid')

// Stripe-mock service: mimics the shape of a real Stripe integration
// (checkout session → webhook confirmation) without calling out to Stripe,
// so the rest of the app (subscriptions, receipts) can be wired the same
// way it would be against the real API later.
async function createMockCheckoutSession({ userId, plan, amount }) {
  const sessionId = `cs_mock_${uuid()}`
  return {
    id: sessionId,
    url: `https://mock-checkout.syncwave.app/pay/${sessionId}`,
    amount,
    plan,
    userId,
    status: 'open',
    createdAt: new Date(),
  }
}

// Simulates Stripe's webhook payload for a completed checkout — in a real
// integration this handler would verify the Stripe-Signature header.
function parseMockWebhookEvent(body) {
  return {
    type: body.type || 'checkout.session.completed',
    data: body.data || {},
  }
}

module.exports = { createMockCheckoutSession, parseMockWebhookEvent }
