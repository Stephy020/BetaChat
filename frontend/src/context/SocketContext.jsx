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

            const socket = io(socketUrl, {
                query: {
                    userId: authUser._id,
                },
                transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });

            setSocket(socket);

            socket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            })

            return () => socket.close();
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