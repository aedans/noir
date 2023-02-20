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
  try {
    const cards = fs.readdirSync("./public/cards").map((file) => file.substring(0, file.lastIndexOf(".")));
    const cardStates = cards.map((name) => defaultCardState(name, name));
    const allCards = cardStates.map((state) => ({
      state,
      info: defaultUtil.getCardInfo(new Map(), initialGameState(), state),
    }));
    const orderedCards = ordered(allCards, ["color", "money"], (card) => card.info);
    res.json(orderedCards.map((card) => card.state.name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.use("*", express.static("dist"));

io.on("connection", (socket) => {
  console.log("Socket " + socket.id + " connected");

  socket.on("queue", async (queue) => {
    try {
      await queues[queue].push(socket);
    } catch (e) {
      socket.emit("error", (e as Error).message);
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket " + socket.id + " disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
