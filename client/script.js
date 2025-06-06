import { io as socketIoClient } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");
const messageContainer = document.getElementById("message-container");

const socket = socketIoClient("http://localhost:3000");
const userSocket = socketIoClient("http://localhost:3000/user", {
    auth: { token: "TestUser123" }
});

socket.on("connect", () => {
    displayMessage(`Connected to main namespace: ${socket.id}`);
});

userSocket.on("connect", () => {
    displayMessage(`Connected to /user as: ${userSocket.id}`);
});

socket.on("receive-message", (message) => {
    displayMessage(message);
});

userSocket.on("receive-message", (message) => {
    displayMessage(`[USER] ${message}`);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;

    if (message === "") return;
    displayMessage(`You: ${message}`);
    socket.emit('send-message', message, room);
    messageInput.value = "";
});

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
    socket.emit("join-room", room, (message) => {
        displayMessage(message);
    });
});

function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    messageContainer.append(div);
}
