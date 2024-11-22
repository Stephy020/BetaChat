import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:["https://betachat-cn5b.onrender.com"],
        methods:["GET","POST"]
    }
})

export  const getRecieverSocketId = (recieverId) => {
    return userSocketMap[recieverId];
}

const userSocketMap = {}; //{userId: socketId}

io.on('connection',(socket)=>{
    console.log("A user conneccted",socket.id);

    const userId = socket.handshake.query.userId;
    if(userId != "undefined") userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);

    //io.emit is used to send events to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    // socket.on  is used to listen to the events and this can be used on both client and server side
    socket.on("disconnect",()=>{
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));

    })
})

export {app, io, server}