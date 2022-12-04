import { AnyAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState } from "./card";
import { v4 as uuidv4 } from "uuid";

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
  id?: string;
  name: string;
};

export type SetPropAction = {
  card: { id: string };
  name: string;
  value: any;
};

export type AddMoneyAction = {
  player: PlayerId,
  money: number,
}

export function findCard(game: GameState, card: { id: string }) {
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

export function updateCard(game: GameState, card: { id: string }, f: (card: CardState) => void) {
  const info = findCard(game, card);
  if (info) {
    const { player, zone, index } = info;
    f(game.players[player][zone][index]);
  }
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
        id: action.payload.id ?? uuidv4(),
        name: action.payload.name,
        props: {},
      });
    },
    setProp: (state, action: PayloadAction<SetPropAction>) => {
      updateCard(state, action.payload.card, (card) => {
        card.props[action.payload.name] = action.payload.value;
      });
    },
    addMoney: (state, action: PayloadAction<AddMoneyAction>) => {
      state.players[action.payload.player].money += action.payload.money;
    }
  },
});

export const { reset, endTurn, moveCard, createCard, setProp } = gameSlice.actions;
