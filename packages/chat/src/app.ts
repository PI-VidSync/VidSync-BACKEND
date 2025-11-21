import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Optionally define REST endpoints
app.get("/health", (req, res) => res.send({ status: "ok" }));

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("chat:message", (msg) => {
    console.log("Message received:", msg);
    io.emit("chat:message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

export { server };
