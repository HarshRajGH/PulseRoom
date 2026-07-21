const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const env = require('./env')
const User = require('../models/User.model')
const { ROLES } = require('../utils/constants')

// Google OAuth — creates or links a SyncWave account by email.
if (env.google.clientId && env.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              isEmailVerified: true,
              role: ROLES.LISTENER,
              avatarUrl: profile.photos?.[0]?.value,
            })
          } else if (!user.googleId) {
            user.googleId = profile.id
            await user.save()
          }
          return done(null, user)
        } catch (err) {
          return done(err, null)
        }
      },
    ),
  )
}

// Spotify OAuth is implemented as a lightweight custom strategy (see
// routes/auth.routes.js) rather than passport-spotify, to avoid an extra
// dependency — it follows the same authorization-code exchange pattern.

module.exports = passport
