import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ["https://betachat-cn5b.onrender.com"]
            : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    },
    // Mobile optimization: longer timeouts for unstable connections
    pingTimeout: 60000,
    pingInterval: 25000,
    // Allow both transports
    transports: ['polling', 'websocket'],
    // Allow upgrades from polling to websocket
    allowUpgrades: true
})

export const getRecieverSocketId = (recieverId) => {
    return userSocketMap[recieverId];
}

const userSocketMap = {}; //{userId: socketId}

io.on('connection', (socket) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User connected:`, socket.id);
    console.log('Transport:', socket.conn.transport.name);

    const userId = socket.handshake.query.userId;
    if (userId != "undefined") {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} mapped to socket ${socket.id}`);
    }

    //io.emit is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // socket.on  is used to listen to the events and this can be used on both client and server side
    socket.on("disconnect", (reason) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] User disconnected:`, socket.id, 'Reason:', reason);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { app, io, server }