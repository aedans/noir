import { Server, Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { QueueName } from "../server/Queue";
import { Target } from "./card";
import { Deck } from "./decksSlice";
import { PlayerId } from "./gameSlice";
import { HistoryAction } from "./historySlice";

export type PlayerAction = { type: "end" } | { type: "do"; id: string; target?: Target; prepared: Target[] };

export type PlayerInit = { deck: Deck };

export type ServerToClientEvents = {
  init: (player: PlayerId) => void;
  actions: (actions: HistoryAction[], name: string) => void;
  error: (error: string) => void;
  end: (winner: PlayerId) => void;
};

export type ClientToServerEvents = {
  queue: (queue: QueueName, name: string) => void;
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
