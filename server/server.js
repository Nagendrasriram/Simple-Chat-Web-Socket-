const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { instrument } = require("@socket.io/admin-ui");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8080", "http://127.0.0.1:5500", "https://admin.socket.io"],
        credentials: true,
    }
});

// 👇 Serve static frontend from ../client folder
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// ======== USER NAMESPACE SETUP ========
const userIo = io.of('/user');

userIo.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        socket.username = getUsernameFromToken(token);
        next();
    } else {
        next(new Error("Authentication token missing"));
    }
});

userIo.on("connection", (socket) => {
    console.log("User namespace connected:", socket.username);
    socket.emit("receive-message", `Welcome ${socket.username}!`);
});

// ======== DEFAULT NAMESPACE SETUP ========
io.on('connection', (socket) => {
    console.log("Socket connected on default namespace:", socket.id);

    socket.on('send-message', (message, room) => {
        console.log(`Message: "${message}" to room: "${room}"`);
        if (room === '') {
            socket.broadcast.emit('receive-message', message);
        } else {
            socket.to(room).emit("receive-message", message);
        }
    });

    socket.on('join-room', (room, cb) => {
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
        cb(`Joined: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected:", socket.id);
    });
});

function getUsernameFromToken(token) {
    return token;
}

// Admin UI
instrument(io, { auth: false });

server.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
