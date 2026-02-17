const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    // Always set up serialize/deserialize for session support
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // Check if Google OAuth credentials are configured
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret || clientID.includes('your_') || clientSecret.includes('your_')) {
        console.log('⚠️  Google OAuth not configured - Google login will be disabled');
        console.log('   To enable: Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
        return;
    }

    console.log('✓ Google OAuth configured');

    passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL: '/api/auth/google/callback',
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check for existing user by googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists with same email
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ email: email.toLowerCase() });
                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        user.avatar = user.avatar || profile.photos?.[0]?.value;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName || 'User',
                    email: email?.toLowerCase() || `${profile.id}@google.user`,
                    avatar: profile.photos?.[0]?.value || null
                });

                done(null, user);
            } catch (err) {
                console.error('Google Strategy Error:', err);
                done(err, null);
            }
        }
    ));
};
