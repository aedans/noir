import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { queues } from "./Queue";

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static("dist"));
app.use(express.static("public"));
app.use(express.json());

app.get("/*", (req, res) => {
  res.redirect("/");
});

io.on("connection", (socket) => {
  socket.on("queue", (queue) => {
    try {
      queues[queue].push(socket);
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
