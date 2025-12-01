import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import io from "socket.io-client";
import { AuthContext, useAuthContext } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
}

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContext();

    useEffect(() => {
        if (authUser) {
            // Use window.location.origin in production, localhost in development
            const socketUrl = import.meta.env.MODE === 'production'
                ? window.location.origin
                : "http://localhost:5000";

            console.log('[Socket] Connecting to:', socketUrl);

            const socket = io(socketUrl, {
                query: {
                    userId: authUser._id,
                },
                // Mobile-optimized: polling first for better compatibility, then upgrade to websocket
                transports: ['polling', 'websocket'],
                // More aggressive reconnection for mobile networks
                reconnectionAttempts: 15,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                // Longer timeout for slower mobile connections
                timeout: 20000,
                // Important for mobile: allow upgrade from polling to websocket when stable
                upgrade: true,
                // Helps with mobile network switches
                rememberUpgrade: true
            });

            setSocket(socket);

            // Connection event handlers
            socket.on('connect', () => {
                console.log('[Socket] Connected:', socket.id);
            });

            socket.on('connect_error', (error) => {
                console.error('[Socket] Connection error:', error.message);
            });

            socket.on('disconnect', (reason) => {
                console.log('[Socket] Disconnected:', reason);
                if (reason === 'io server disconnect') {
                    // Server disconnected, try to reconnect
                    socket.connect();
                }
            });

            socket.on('reconnect', (attemptNumber) => {
                console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
            });

            socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('[Socket] Reconnection attempt', attemptNumber);
            });

            socket.on('reconnect_error', (error) => {
                console.error('[Socket] Reconnection error:', error.message);
            });

            socket.on('reconnect_failed', () => {
                console.error('[Socket] Reconnection failed after all attempts');
            });

            socket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                console.log('[Socket] Cleaning up connection');
                socket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }

    }, [authUser])

    return <SocketContext.Provider value={{ socket, onlineUsers }}>
        {children}
    </SocketContext.Provider>
}