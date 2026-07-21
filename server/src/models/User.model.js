const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const env = require('../config/env')
const { ROLES } = require('../utils/constants')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    handle: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.LISTENER },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, select: false },
    bio: { type: String, maxlength: 280, default: '' },
    plan: { type: String, default: 'free' },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    googleId: { type: String, select: false },
    spotifyId: { type: String, select: false },
    spotifyConnected: { type: Boolean, default: false },
    spotifyAccessToken: { type: String, select: false },
    spotifyRefreshToken: { type: String, select: false },
    spotifyTokenExpiresAt: { type: Date, select: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastLoginAt: { type: Date },
    refreshTokenHash: { type: String, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerifyTokenHash: { type: String, select: false },
  },
  { timestamps: true },
)

userSchema.index({ name: 'text', handle: 'text' })

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokenHash
  delete obj.passwordResetTokenHash
  delete obj.emailVerifyTokenHash
  return obj
}

module.exports = mongoose.model('User', userSchema)
