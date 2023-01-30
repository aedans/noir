import cors from "cors";
import express from "express";
import http from "http";
import fs from "fs";
import { Server } from "socket.io";
import { queues } from "./Queue";
import { defaultCardState, initialGameState } from "../common/gameSlice";
import { ordered } from "../common/util";
import { defaultUtil } from "./card";

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static("public"));
app.use(express.static("dist"));
app.use(express.json());

app.get("/cards.json", (req, res) => {
  const cards = fs.readdirSync("./public/cards").map((file) => file.substring(0, file.lastIndexOf(".")));
  const cardStates = cards.map((name) => defaultCardState(name, name));
  const allCards = cardStates.map((state) => ({ state, info: defaultUtil.getCardInfo(initialGameState(), state) }));
  const orderedCards = ordered(allCards, ["color", "money"], (card) => card.info);
  res.send(JSON.stringify(orderedCards.map((card) => card.state.name)));
});

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
