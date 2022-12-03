import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState } from "./card";
import { v4 as uuidv4 } from "uuid";

export const zones = ["deck", "board", "graveyard"] as const;
export type Zone = typeof zones[number];

export type PlayerState = { [zone in Zone]: CardState[] };
export type PlayerId = 0 | 1;

export type GameState = {
  players: [PlayerState, PlayerState];
  turn: number;
};

export type PlayerZone = {
  zone: Zone;
  player: PlayerId;
};

export const initialState: GameState = {
  players: [
    {
      deck: [],
      board: [],
      graveyard: [],
    },
    {
      deck: [],
      board: [],
      graveyard: [],
    },
  ],
  turn: 0,
};

export type MoveCardAction = {
  id: string;
  from: PlayerZone;
  to: PlayerZone;
};

export type CreateCardAction = PlayerZone & {
  id?: string;
  name: string;
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    reset: () => initialState,
    endTurn: (state) => {
      state.turn++;
    },
    moveCard: (state, action: PayloadAction<MoveCardAction>) => {
      const { from, to } = action.payload;
      const card = state.players[from.player][from.zone].find((c) => c.id == action.payload.id);

      if (card) {
        state.players[from.player][from.zone] = state.players[from.player][from.zone].filter((c) => c.id != card.id);
        state.players[to.player][to.zone].push(card);
      }
    },
    createCard: (state, action: PayloadAction<CreateCardAction>) => {
      state.players[action.payload.player][action.payload.zone].push({
        id: action.payload.id ?? uuidv4(),
        name: action.payload.name,
      });
    },
  },
});

export const { reset, endTurn, moveCard, createCard } = gameSlice.actions;
