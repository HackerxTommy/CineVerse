const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const connectDB = require('./config/db');
const { initializeWebSocket } = require('./config/websocket');

// Load env vars FIRST before anything else
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database and Redis
connectDB();
const { initRedis } = require('./config/redis');
initRedis();

const app = express();
const isVercel = process.env.VERCEL === '1';

// Only create HTTP server and WebSocket when NOT on Vercel (serverless)
const server = isVercel ? null : http.createServer(app);

// Trust reverse proxy (needed for secure cookies over HTTPS)
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction || isVercel) {
    app.set('trust proxy', 1);
}

// Initialize WebSocket (Socket.IO) — not supported on Vercel serverless
if (!isVercel && server) {
    const io = initializeWebSocket(server);
    app.set('io', io);
}

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Cookie parser (required for CSRF double-submit cookie pattern)
app.use(cookieParser());

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for Passport (Persisted in MongoDB to survive Vercel Serverless restarts)
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    store: (function() {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is missing. Session persistence will fail!');
            return undefined; // Falls back to MemoryStore (last resort)
        }
        return MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
            ttl: 24 * 60 * 60 // 1 day
        });
    })(),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    }
}));

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ─── CSRF Protection (Double-Submit Cookie Pattern) ───
const { generateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.SESSION_SECRET || 'csrf-secret-fallback',
    cookieName: '__csrf',
    cookieOptions: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
    },
    size: 64,
    getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Endpoint to get a CSRF token (client calls this on app load)
app.get('/api/auth/csrf-token', (req, res) => {
    const token = generateToken(req, res);
    res.json({ csrfToken: token });
});

// Apply CSRF protection to all state-changing routes
// Skip: GET, HEAD, OPTIONS (safe methods) and the Stripe webhook
app.use((req, res, next) => {
    // Skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Skip Stripe webhook (uses its own signature verification)
    if (req.path === '/api/payments/webhook') {
        return next();
    }
    // Validate CSRF token
    doubleCsrfProtection(req, res, next);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/2fa', require('./routes/twoFactorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint (always available)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CineVerse API is running', version: '2.0.0' });
});

// ─── Serve React client if built files exist ───
const fs = require('fs');
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(path.join(publicPath, 'index.html'))) {
    app.use(express.static(publicPath));

    // SPA fallback — any non-API route serves the React app
    app.get(/^\/(?!api\/).*/, (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    // No built client — show health check at root (dev mode)
    app.get('/', (req, res) => {
        res.json({ status: 'ok', message: 'CineVerse API is running (no client build found)', version: '2.0.0' });
    });
}

// 404 Handler (only hits for unmatched /api/* routes when client is bundled)
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

// Only start listening when running as a standalone server (not on Vercel)
if (!isVercel && server) {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 WebSocket ready`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export for Vercel serverless
module.exports = app;
