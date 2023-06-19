import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import { Server } from "socket.io";
import { queues } from "./Queue";
import { defaultCardState, initialGameState } from "../common/gameSlice";
import { ordered } from "../common/util";
import { defaultUtil } from "./card";
import { findReplay, findReplayIds } from "./db/replay";
import { ObjectId } from "mongodb";
import { NoirServer } from "../common/network";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io: NoirServer = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static("public"));
app.use(express.static("dist"));
app.use(express.json());

app.get("/api/cards", (req, res) => {
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

app.get("/api/replays", async (req, res) => {
  try {
    res.json(await findReplayIds(Number(req.query.skip ?? "0")));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/replays/:replay", async (req, res) => {
  try {
    res.json(await findReplay(new ObjectId(req.params.replay)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.use("*", express.static("dist"));

io.on("connection", (socket) => {
  socket.on("queue", async (queue, name) => {
    try {
      await queues[queue].push(socket, name);
    } catch (e) {
      socket.emit("error", (e as Error).message);
      console.error(e);
    }
  });
});

const port = process.env.PORT ?? 8080;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
