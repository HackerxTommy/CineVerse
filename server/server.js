const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const { initializeWebSocket } = require('./config/websocket');

// Load env vars FIRST before anything else
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Trust Render's reverse proxy (needed for secure cookies over HTTPS)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Initialize WebSocket (Socket.IO)
const io = initializeWebSocket(server);
app.set('io', io);

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

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for Passport
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax' // 'none' needed for cross-origin Render subdomains
    }
}));

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/2fa', require('./routes/twoFactorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'CineVerse API is running', version: '2.0.0' });
});

// 404 Handler
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

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
