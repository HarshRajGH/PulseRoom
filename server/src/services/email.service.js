const { enqueueEmail } = require('../jobs/queues/email.queue')
const env = require('../config/env')

async function sendVerificationEmail(user, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`
  return enqueueEmail({
    to: user.email,
    subject: 'Verify your SyncWave email',
    html: `<p>Hi ${user.name},</p><p>Confirm your email to finish setting up your account:</p><p><a href="${link}">${link}</a></p>`,
  })
}

async function sendPasswordResetEmail(user, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`
  return enqueueEmail({
    to: user.email,
    subject: 'Reset your SyncWave password',
    html: `<p>Hi ${user.name},</p><p>Use the link below to reset your password. This link expires in 1 hour.</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  })
}

async function sendWelcomeEmail(user) {
  return enqueueEmail({
    to: user.email,
    subject: 'Welcome to SyncWave 🎧',
    html: `<p>Hi ${user.name},</p><p>Your account is ready. Jump into a live room or start your own — someone's always spinning something.</p>`,
  })
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail }
