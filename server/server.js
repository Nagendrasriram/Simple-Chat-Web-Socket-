// server.js
const { instrument } = require('@socket.io/admin-ui');
const { Server } = require('socket.io');

// Create the Socket.IO server
const io = new Server(3000, {
    cors: {
        origin: ["http://localhost:8080", "http://127.0.0.1:5500", "https://admin.socket.io"],
        credentials: true,
    }
});

// ======== USER NAMESPACE SETUP ========
const userIo = io.of('/user');

// Middleware to authenticate user
userIo.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        socket.username = getUsernameFromToken(token);
        next();
    } else {
        next(new Error("Authentication token missing"));
    }
});

// Handle connections to /user namespace
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

// Dummy function to simulate token decoding
function getUsernameFromToken(token) {
    // In production, decode token here using JWT or other method
    return token;
}

// Integrate Socket.IO Admin UI
instrument(io, { auth: false });
