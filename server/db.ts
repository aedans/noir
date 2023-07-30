import moize from "moize";
import { Collection, MongoClient } from "mongodb";
import { GameAction, Winner, defaultCardState, initialGameState } from "../common/gameSlice.js";
import { PlayerInit } from "../common/network.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import fs from "fs";
import { ordered } from "../common/util.js";

export type User = {
  _id: string;
  experience: { [name: string]: number };
};

export type ReplayMeta = {
  timestamp: Date;
  winner: Winner;
  queue: string;
  names: [string, string];
};

export type Replay = ReplayMeta & {
  ids: [string | null, string | null];
  inits: [PlayerInit, PlayerInit];
  history: GameAction[];
};

export const noirDB = moize.promise(async () => {
  const client = new MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  return client.db("noir");
});

export const userCollection = moize.promise(async () => (await noirDB()).collection("users") as Collection<User>);
export const replayCollection = moize.promise(async () => (await noirDB()).collection("replays") as Collection<Replay>);

export const cards = moize(() => {
  const cards = fs.readdirSync("./public/cards").map((file) => file.substring(0, file.lastIndexOf(".")));
  const cardStates = cards.map((name) => defaultCardState(name));
  const allCards = cardStates.map((state) => ({
    state,
    info: new LocalCardInfoCache().getCardInfo(initialGameState(), state),
  }));
  const orderedCards = ordered(allCards, ["color", "money"], (card) => card.info);
  return orderedCards.map((card) => card.state.name);
});
