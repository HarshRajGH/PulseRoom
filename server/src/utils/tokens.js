const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const env = require('../config/env')

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry })
}

// Short-lived token round-tripped through OAuth `state` params — verifies
// the callback belongs to the same server-issued flow (CSRF) and, for the
// "link existing account" flow, which logged-in user initiated it.
function signStateToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: '10m' })
}

function verifyStateToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry })
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

module.exports = {
  signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken,
  generateRandomToken, hashToken, signStateToken, verifyStateToken,
}
