import moize from "moize";
import { MongoClient, ObjectId } from "mongodb";
import { GameAction, Winner } from "../../common/gameSlice";
import { PlayerInit } from "../../common/network";

export type Replay = {
  winner: Winner;
  queue: string;
  names: [string, string];
  inits: [PlayerInit, PlayerInit];
  history: GameAction[];
};

const replayCollection = moize.promise(async () => {
  const client = new MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  return client.db("noir").collection("replays");
});

export async function insertReplay(replay: Replay) {
  const replays = await replayCollection();
  replays.insertOne({
    timestamp: new Date(),
    ...replay,
  });
}

export async function findReplayIds() {
  const replays = await replayCollection();
  const results = await replays
    .find({}, { limit: 10 })
    .sort({ _id: -1 })
    .project({ _id: 1, names: 1, queue: 1, winner: 1, timestamp: 1 })
    .toArray();
  return results;
}

export async function findReplay(id: ObjectId) {
  const replays = await replayCollection();
  const result = await replays.findOne({ _id: id });
  return result;
}
