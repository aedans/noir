import * as dotenv from "dotenv";
import moize from "moize";
import { MongoClient } from "mongodb";
import { GameAction } from "../common/gameSlice";

const replayCollection = moize.promise(async () => {
  dotenv.config();
  const client = new MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  return client.db("noir").collection("replays");
});

export async function insertReplay(history: GameAction[]) {
  const games = await replayCollection();
  games.insertOne({ history });
}

export async function findReplayIds() {
  const games = await replayCollection();
  const results = await games.find({}, { limit: 10 }).project({ _id: 1 }).toArray();
  return results;
}
