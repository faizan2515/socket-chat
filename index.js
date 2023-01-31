import express from "express";
import { createServer } from "http";
import cors from "cors";

const app = express();
const server = createServer(app);
import { Server } from "socket.io";

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
  socket.on("server-message", (msg) => {
    io.emit("image-review-data", { data: msg });
    console.log(`server: ${msg}`);
  });
  socket.on("image-resolve-data", (data) => {
    io.emit("server-data", data);
    console.log(`client: ${JSON.stringify(data)}`);
  });
});

server.listen(port, () => {
  console.log(`Local: http://localhost:${port}`);
});
