import moize from "moize";
import { Collection, MongoClient } from "mongodb";
import { GameAction, Winner } from "../common/gameSlice.js";
import { PlayerInit } from "../common/network.js";

export type User = {
  _id: string;
  experience: { [name: string]: number };
};

export type Replay = {
  timestamp: Date;
  winner: Winner;
  queue: string;
  ids: [string | null, string | null];
  names: [string, string];
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
