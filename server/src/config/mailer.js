const nodemailer = require('nodemailer')
const env = require('./env')
const logger = require('./logger')

let transporter = null;
let testAccount = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
    return transporter;
  }

  // Create a test account for development if no SMTP credentials exist
  testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  logger.info(`[mailer:dev] Automatically created Ethereal test email account: ${testAccount.user}`);
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const mailer = await getTransporter();
  const info = await mailer.sendMail({ from: env.smtp.from, to, subject, html, text });
  
  if (!env.smtp.host) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logger.info(`[mailer:dev] 🚀 Email sent! View it in your browser here: ${previewUrl}`);
  }
  return info;
}

module.exports = { sendMail, getTransporter }
