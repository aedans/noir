import { Server, Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { Target } from "./card";
import { Deck } from "./decksSlice";
import { HistoryAction } from "./historySlice";

export type PlayerAction = { type: "end" } | { type: "do"; id: string; target?: Target; prepared: Target[] };

export type PlayerInit = { deck: Deck };

export type ServerToClientEvents = {
  init: (player: number) => void;
  actions: (actions: HistoryAction[], name: string) => void;
  error: (error: string) => void;
  end: (winner: number) => void;
};

export type ClientToServerEvents = {
  queue: (queue: string) => void;
  init: (deck: Deck) => void;
  action: (action: PlayerAction) => void;
};

export type NoirServer = Server<ClientToServerEvents, ServerToClientEvents, {}, {}>;
export type NoirServerSocket = ServerSocket<ClientToServerEvents, ServerToClientEvents, {}, {}>;
export type NoirClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>;
