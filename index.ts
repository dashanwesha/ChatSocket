import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const port = parseInt(process.env.PORT || "3001", 10); // Convert to number
const hostname = process.env.HOSTNAME || "localhost";

app.use('/',(request, respond) => {
  respond.send("Server Started");
})
// Enable CORS for frontend communication
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (update for production)
    methods: ["GET", "POST"],
  },
});

// WebSocket handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", ({ room, username }) => {
    socket.join(room);
    console.log(`User ${username} joined room ${room}`);

    const joinMessage = `${username} joined the room`;
    socket.emit("user_joined", joinMessage);
    socket.to(room).emit("user_joined", joinMessage);
  });

  socket.on("message", ({ room, message, sender }) => {
    console.log(`Message from ${sender} in room ${room}: ${message}`);
    io.to(room).emit("message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server (omit hostname)
httpServer.listen(port, () => {
  console.log(`Backend server running at http://${hostname}:${port}`);
});
