import * as dotenv from "dotenv";
import moize from "moize";
import { MongoClient, ObjectId } from "mongodb";
import { GameAction } from "../common/gameSlice";

const replayCollection = moize.promise(async () => {
  dotenv.config();
  const client = new MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  return client.db("noir").collection("replays");
});

export async function insertReplay(history: GameAction[]) {
  const replays = await replayCollection();
  replays.insertOne({ history });
}

export async function findReplayIds() {
  const replays = await replayCollection();
  const results = await replays.find({}, { limit: 10 }).sort({ _id: -1 }).project({ _id: 1 }).toArray();
  return results;
}

export async function findReplay(id: ObjectId) {
  const replays = await replayCollection();
  const result = await replays.findOne({ _id: id });
  return result;
}
