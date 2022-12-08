import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState, Target } from "./card";
import { v4 as uuid } from "uuid";

export const zones = ["deck", "board", "graveyard"] as const;
export type Zone = typeof zones[number];

export type PlayerId = 0 | 1;
export type PlayerState = { [zone in Zone]: CardState[] } & {
  money: number;
};

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
      money: 0,
      deck: [],
      board: [],
      graveyard: [],
    },
    {
      money: 0,
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
  id: string,
  name: string;
};

export type RemoveCardAction = {
  card: Target;
};

export type SetPropAction = {
  card: Target;
  name: string;
  value: any;
};

export type AddMoneyAction = {
  player: PlayerId;
  money: number;
};

export function findCard(game: GameState, card: Target) {
  for (const player of [0, 1] as const) {
    for (const zone of zones) {
      const index = game.players[player][zone].findIndex((c) => c.id == card.id);
      if (index >= 0) {
        return { player, zone, index };
      }
    }
  }

  return null;
}

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
        id: action.payload.id,
        name: action.payload.name,
        props: {},
      });
    },
    removeCard: (state, action: PayloadAction<RemoveCardAction>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone].splice(index, 1);
      }
    },
    setProp: (state, action: PayloadAction<SetPropAction>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone][index].props[action.payload.name] = action.payload.value;
      }
    },
    addMoney: (state, action: PayloadAction<AddMoneyAction>) => {
      state.players[action.payload.player].money += action.payload.money;
    },
  },
});

export const { reset, endTurn, moveCard, createCard, setProp } = gameSlice.actions;
