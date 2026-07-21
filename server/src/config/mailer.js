const nodemailer = require('nodemailer')
const env = require('./env')
const logger = require('./logger')

// Falls back to a JSON-logging "stream" transport in development when SMTP
// credentials aren't configured, so the app runs out of the box without a
// real mail provider.
const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true })

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({ from: env.smtp.from, to, subject, html, text })
  if (!env.smtp.host) logger.info(`[mailer:dev] Email to ${to} — "${subject}" (SMTP not configured, not actually sent)`)
  return info
}

module.exports = { transporter, sendMail }
