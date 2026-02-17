const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Don't auto-login - redirect to login page
        res.status(201).json({
            success: true,
            message: 'Account created successfully! Please login.'
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        console.log(`Login attempt for: ${email}`);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.password) {
            console.log('User has no password (likely OAuth)');
            return res.status(400).json({ message: 'This account uses Google login. Please sign in with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check 2FA
        if (user.twoFactorEnabled) {
            return res.json({
                require2FA: true,
                userId: user._id,
                message: '2FA verification required'
            });
        }

        req.login(user, (err) => {
            if (err) {
                console.error('Login failed:', err);
                return res.status(500).json({ message: 'Login failed' });
            }
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            });
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Auth with Google
// @route   GET /api/auth/google
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        if (err) {
            console.error('Google auth error:', err);
            return res.redirect(`${clientUrl}/login?error=auth_failed`);
        }
        if (!user) {
            console.error('Google auth - no user:', info);
            return res.redirect(`${clientUrl}/login?error=no_user`);
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.redirect(`${clientUrl}/login?error=login_failed`);
            }
            res.redirect(clientUrl);
        });
    })(req, res, next);
};

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
        });
    });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getCurrentUser = (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            role: req.user.role
        });
    } else {
        res.json(null);
    }
};
