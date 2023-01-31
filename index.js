const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

let connectedClients = [];

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
  connectedClients.push({ id: socket.id, count: 0 });
  console.log(`Client connected with id: ${socket.id}`);

  socket.on("disconnect", () => {
    // Remove the disconnected socket
    connectedClients = connectedClients.filter(
      (client) => client.id !== socket.id
    );
    console.log(`Client disconnected with id: ${socket.id}`);
  });
  socket.on("server-message", (msg) => {
    const currentClient = getCurrentClient([...connectedClients.slice(1)]);
    connectedClients = connectedClients.map((client) => {
      if (client.id === currentClient.id) {
        return { id: client.id, count: client.count + 1 };
      }
      return client;
    });

    io.to(currentClient.id).emit("image-review-data", { data: msg });
  });
  socket.on("image-resolve-data", (data) => {
    connectedClients = connectedClients.map((client) => {
      if (client.id === socket.id) {
        return { id: client.id, count: client.count - 1 };
      }
      return client;
    });
    io.emit("server-data", data);
  });
});

server.listen(port, () => {
  console.log(`Local: http://localhost:${port}`);
});

function getCurrentClient(connectedClients) {
  if (connectedClients.length === 0) return null;
  const currentClient = connectedClients.reduce((prev, curr) =>
    prev.count < curr.count ? prev : curr
  );

  return currentClient;
}
