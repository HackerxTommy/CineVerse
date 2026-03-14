import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : '/';

/**
 * Custom hook for Socket.IO connection to a specific show room.
 * Provides real-time seat updates (locks, bookings).
 *
 * Usage:
 *   const { seatUpdates, isConnected } = useSocket(showId);
 *
 * @param {string} showId - The show ID to join
 * @returns {{ seatUpdates: object[], isConnected: boolean }}
 */
export function useSocket(showId) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [seatUpdates, setSeatUpdates] = useState([]);

    const clearUpdates = useCallback(() => {
        setSeatUpdates([]);
    }, []);

    useEffect(() => {
        if (!showId) return;

        // Create socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            // Join the show room
            socket.emit('joinShow', showId);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for seat lock events
        socket.on('seatLocked', (data) => {
            setSeatUpdates(prev => [...prev, { type: 'locked', ...data, timestamp: Date.now() }]);
        });

        // Listen for seat booked events
        socket.on('seatBooked', (data) => {
            setSeatUpdates(prev => [...prev, { type: 'booked', ...data, timestamp: Date.now() }]);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.emit('leaveShow', showId);
                socket.disconnect();
            }
        };
    }, [showId]);

    return { seatUpdates, isConnected, clearUpdates };
}

export default useSocket;
