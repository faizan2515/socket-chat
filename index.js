const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = 5000 || process.env.PORT;

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  io.emit("user-connected", { id: socket.id });
  console.log(`Client connected with id: ${socket.id}`);

  socket.on("disconnect", () => {
    io.emit("user-disconnected", { id: socket.id });
    console.log(`Client disconnected with id: ${socket.id}`);
  });
  socket.on("send-message", (msg) => {
    io.emit("receive-message", { id: socket.id, message: msg });
  });
});

server.listen(port, () => {
  console.log(`Local: http://localhost:${port}`);
});
