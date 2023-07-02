import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import { Server } from "socket.io";
import { queues } from "./Queue.js";
import { defaultCardState, initialGameState } from "../common/gameSlice.js";
import { ordered } from "../common/util.js";
import { ObjectId } from "mongodb";
import { NoirServer } from "../common/network.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import openid from "express-openid-connect";
import { replayCollection, userCollection } from "./db.js";
import { nanoid } from "nanoid";
import { getCosmetic, getTop } from "./cosmetics.js";
import moize from "moize";

dotenv.config();

const port = process.env.PORT ?? 8080;
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

app.use(
  openid.auth({
    authRequired: false,
    auth0Logout: true,
    baseURL: `https://noirccg.azurewebsites.net/`,
    clientID: "FAjKuxWF6fHa4OInqatXqp4DuMRQbNvz",
    issuerBaseURL: "https://dev-risee24h3navjxas.us.auth0.com",
    secret: "YUUDX5Ne1RfV2vUs0J2EDITAwNVV-PEBQr0C_t_i1ZJfJsaAxJRYydHcJl7CHaFD",
  })
);

const cards = moize(() => {
  const cards = fs.readdirSync("./public/cards").map((file) => file.substring(0, file.lastIndexOf(".")));
  const cardStates = cards.map((name) => defaultCardState(name, name));
  const allCards = cardStates.map((state) => ({
    state,
    info: new LocalCardInfoCache().getCardInfo(initialGameState(), state),
  }));
  const orderedCards = ordered(allCards, ["color", "money"], (card) => card.info);
  return orderedCards.map((card) => card.state.name);
});

app.get("/api/cards", (req, res) => {
  try {
    res.json(cards());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/replays", async (req, res) => {
  try {
    const replays = await replayCollection();
    const results = await replays
      .find({}, { limit: 20, skip: Number(req.query.skip ?? "0") })
      .sort({ _id: -1 })
      .project({ _id: 1, names: 1, queue: 1, winner: 1, timestamp: 1 })
      .toArray();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/replays/:replay", async (req, res) => {
  try {
    const replays = await replayCollection();
    res.json(await replays.findOne({ _id: new ObjectId(req.params.replay) }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

const auth: Map<string, string> = new Map();

app.get("/auth", openid.requiresAuth(), (req, res) => {
  try {
    let token: string | null = null;
    if (req.oidc.user) {
      token = nanoid();
      auth.set(token, req.oidc.user.sub);

      setTimeout(() => auth.delete(token!), 60000);
    }

    res.json({ ...req.oidc.user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/user", openid.requiresAuth(), async (req, res) => {
  try {
    const id = req.oidc.user!.sub;
    const users = await userCollection();
    const user = await users.findOne({ _id: id });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/top", openid.requiresAuth(), async (req, res) => {
  try {
    const id = req.oidc.user!.sub;
    const top = await Promise.all(cards().map((name) => getTop(name).then((top) => ({ name, id: top.id }))));
    res.json(top.filter((x) => x.id == id).map((x) => x.name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.use("*", express.static("dist"));

io.on("connection", (socket) => {
  socket.on("queue", async (queue, name, token) => {
    try {
      const id = token ? auth.get(token) ?? null : null;
      await queues[queue].push(socket, name, id);
    } catch (e) {
      socket.emit("error", (e as Error).message);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
