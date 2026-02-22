const { Server } = require('socket.io');

/**
 * Initialize Socket.IO WebSocket server
 * @param {http.Server} httpServer - The HTTP server to attach to
 * @returns {Server} Socket.IO server instance
 */
function initializeWebSocket(httpServer) {
    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join a show room — allows targeted events per show
        socket.on('joinShow', (showId) => {
            socket.join(`show:${showId}`);
            console.log(`👤 ${socket.id} joined show:${showId}`);
        });

        // Leave a show room
        socket.on('leaveShow', (showId) => {
            socket.leave(`show:${showId}`);
            console.log(`👤 ${socket.id} left show:${showId}`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
        });

        socket.on('error', (err) => {
            console.error(`Socket error (${socket.id}):`, err.message);
        });
    });

    console.log('✅ WebSocket (Socket.IO) initialized');
    return io;
}

module.exports = { initializeWebSocket };
