import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState } from "./card";

export const zones = ["hand", "board", "graveyard"] as const;
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

export function currentPlayer(game: { turn: number }): PlayerId {
  return game.turn % 2 == 0 ? 0 as const : 1 as const;
}

export function findCard(id: string, game: GameState): PlayerZone {
  for (const player of [0, 1] as const) {
    for (const zone of zones) {
      const card = game.players[player][zone].find((c) => c.id == id);
      if (card) {
        return { player, zone };
      }
    }
  }

  throw new Error(`Card ${id} does not exist`);
}

export const initialState: GameState = {
  players: [
    {
      hand: [
        {
          id: "a",
          name: "Crisp Fiver",
        },
        {
          id: "b",
          name: "Random Citizen",
        },
      ],
      board: [],
      graveyard: [],
    },
    {
      hand: [],
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

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
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
  },
});

export const { endTurn, moveCard } = gameSlice.actions;
