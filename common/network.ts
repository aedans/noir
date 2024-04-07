import { Server, Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { QueueName } from "../server/Queue.js";
import { CardCosmetic, Target } from "./card.js";
import { Deck } from "../common/decks.js";
import { GameAction, PlayerId, Winner } from "./gameSlice.js";
export type { NoirRouter } from "../server/index.js";
export type { User, ReplayMeta, Replay } from "../server/db.js";
export type { MissionName, Difficulty } from "../server/Mission.js";
export type { QueueName } from "../server/Queue.js";

export type PlayerAction = { type: "end" } | { type: "do"; id: string; target?: Target };

export type PlayerInit = { deck: Deck };

export type ServerToClientEvents = {
  init: (player: PlayerId, names: readonly [string, string]) => void;
  actions: (actions: GameAction[], name: string) => void;
  cosmetic: (id: string, cosmetic: CardCosmetic) => void;
  error: (error: string) => void;
  end: (winner: Winner) => void;
};

export type ClientToServerEvents = {
  queue: (queue: QueueName, name: string, token: string | null) => void;
  init: (deck: Deck) => void;
  action: (action: PlayerAction) => void;
  concede: () => void;
};

export type SocketData = {
  name: string;
};

export type NoirServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
export type NoirServerSocket = ServerSocket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
export type NoirClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>;
