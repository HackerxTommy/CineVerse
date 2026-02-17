const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// Generate 2FA secret and QR code
exports.setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+twoFactorSecret');

        if (user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is already enabled' });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `CineVerse (${user.email})`,
            issuer: 'CineVerse'
        });

        // Save secret temporarily (not enabled yet)
        user.twoFactorSecret = secret.base32;
        await user.save();

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
            message: 'Scan QR code with Google Authenticator'
        });
    } catch (err) {
        console.error('2FA setup error:', err);
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
};

// Verify and enable 2FA
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await User.findById(req.user._id).select('+twoFactorSecret');

        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: 'Please setup 2FA first' });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps tolerance
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 8; i++) {
            backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }

        user.twoFactorEnabled = true;
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        res.json({
            message: '2FA enabled successfully',
            backupCodes: backupCodes
        });
    } catch (err) {
        console.error('2FA verify error:', err);
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
};

// Validate 2FA token during login
exports.validate2FA = async (req, res) => {
    try {
        const { userId, token, isBackupCode } = req.body;

        const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA not enabled for this user' });
        }

        let verified = false;

        if (isBackupCode) {
            // Check backup codes
            const codeIndex = user.twoFactorBackupCodes.indexOf(token.toUpperCase());
            if (codeIndex > -1) {
                // Remove used backup code
                user.twoFactorBackupCodes.splice(codeIndex, 1);
                await user.save();
                verified = true;
            }
        } else {
            // Verify TOTP
            verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
                window: 2
            });
        }

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Create session
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login failed' });
            }
            res.json({
                message: 'Login successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled
                }
            });
        });
    } catch (err) {
        console.error('2FA validate error:', err);
        res.status(500).json({ message: 'Failed to validate 2FA' });
    }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id).select('+twoFactorSecret');

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is not enabled' });
        }

        // Verify current token before disabling
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        user.twoFactorBackupCodes = [];
        await user.save();

        res.json({ message: '2FA disabled successfully' });
    } catch (err) {
        console.error('2FA disable error:', err);
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
};

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            enabled: user.twoFactorEnabled || false
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get 2FA status' });
    }
};
