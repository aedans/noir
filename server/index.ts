import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { queues } from "./Queue.js";
import { ObjectId, WithId } from "mongodb";
import { NoirServer } from "../common/network.js";
import openid from "express-openid-connect";
import { ReplayMeta, cards, replayCollection, userCollection } from "./db.js";
import { nanoid } from "nanoid";
import { getTop } from "./cosmetics.js";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";
import superjson from "superjson";

dotenv.config();

const port = process.env.PORT ?? 8080;
const app = express();
const server = http.createServer(app);
const io: NoirServer = new Server(server, {
  cors: {
    origin: "*",
  },
});

const auth: Map<string, string> = new Map();

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({ req, res });
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const requiresAuth = t.middleware(async (opts) => {
  await new Promise((resolve) => openid.requiresAuth()(opts.ctx.req, opts.ctx.res, resolve));
  return opts.next({
    ctx: {
      user: opts.ctx.req.oidc.user!,
    },
  });
});

const noirRouter = t.router({
  cards: t.procedure.query(async () => {
    return cards();
  }),
  replay: t.procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const replays = await replayCollection();
    return await replays.findOne({ _id: new ObjectId(input.id) });
  }),
  replays: t.procedure.input(z.object({ skip: z.number().default(0) })).query(async ({ input }) => {
    const replays = await replayCollection();
    const results = await replays
      .find({}, { limit: 20, skip: input.skip })
      .sort({ _id: -1 })
      .project<WithId<ReplayMeta>>({ _id: 1, names: 1, queue: 1, winner: 1, timestamp: 1 })
      .toArray();
    return results;
  }),
  auth: t.procedure.use(requiresAuth).query(async ({ ctx }) => {
    let token: string | null = null;
    if (ctx.user) {
      token = nanoid();
      auth.set(token, ctx.user.sub);

      setTimeout(() => auth.delete(token!), 60000);
    }

    return { ...ctx.user, token };
  }),
  user: t.procedure.use(requiresAuth).query(async ({ ctx }) => {
    const id = ctx.user.sub;
    const users = await userCollection();
    const user = await users.findOne({ _id: id });
    return user;
  }),
  top: t.procedure.use(requiresAuth).query(async ({ ctx }) => {
    const id = ctx.user.sub;
    const top = await Promise.all(cards().map((name) => getTop(name).then((top) => ({ name, id: top.id }))));
    return top.filter((x) => x.id == id).map((x) => x.name);
  }),
});

export type NoirRouter = typeof noirRouter;

if (process.env.AUTH0_SECRET) {
  app.use(
    openid.auth({
      authRequired: false,
      auth0Logout: true,
      baseURL: process.env.PRODUCTION == "true" ? "https://noirccg.azurewebsites.net/" : "http://localhost:8080/",
      clientID: "FAjKuxWF6fHa4OInqatXqp4DuMRQbNvz",
      issuerBaseURL: "https://dev-risee24h3navjxas.us.auth0.com",
      secret: process.env.AUTH0_SECRET ?? "",
    })
  );
}

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: noirRouter,
    createContext,
    middleware: cors(),
  })
);

app.use(cors());
app.use(express.static("public"));
app.use(express.static("dist"));
app.use("*", express.static("dist"));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("queue", async (queue, name, token) => {
    try {
      const id = token ? auth.get(token) ?? null : null;
      await queues[queue].push(socket, name, id);
    } catch (e) {
      if (typeof e == "string") {
        socket.emit("error", e);
      } else {
        socket.emit("error", (e as Error).message);
        console.error(e);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
