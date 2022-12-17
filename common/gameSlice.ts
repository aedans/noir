import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState, Target } from "./card";

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

export const initialGameState: GameState = {
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

export type GameAction = PayloadAction<GameParams>;

export type GameParams = { card?: Target } & (
  | {}
  | MoveCardParams
  | CreateCardParams
  | RemoveCardParams
  | RevealCardParams
  | SetPropParams
  | AddMoneyParams
);

export type MoveCardParams = {
  card: Target;
  to: PlayerZone;
};

export type CreateCardParams = PlayerZone & {
  card: Target;
  name: string;
};

export type RemoveCardParams = {
  card: Target;
};

export type RevealCardParams = {
  card: Target;
};

export type SetPropParams = {
  card: Target;
  name: string;
  value: any;
};

export type AddMoneyParams = {
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

export function getCard(game: GameState, card: Target) {
  const info = findCard(game, card);
  if (info) {
    return game.players[info.player][info.zone][info.index];
  } else {
    return null;
  }
}

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState,
  reducers: {
    endTurn: (state, action: PayloadAction<{}>) => {
      state.turn++;
    },
    moveCard: (state, action: PayloadAction<MoveCardParams>) => {
      const { card, to } = action.payload;
      const from = findCard(state, card);

      if (from) {
        state.players[to.player][to.zone].push(state.players[from.player][from.zone][from.index]);
        state.players[from.player][from.zone].splice(from.index, 1);
      }
    },
    createCard: (state, action: PayloadAction<CreateCardParams>) => {
      state.players[action.payload.player][action.payload.zone].push({
        id: action.payload.card.id,
        name: action.payload.name,
        hidden: true,
        props: {},
      });
    },
    removeCard: (state, action: PayloadAction<RemoveCardParams>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone].splice(index, 1);
      }
    },
    revealCard: (state, action: PayloadAction<RevealCardParams>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone][index].hidden = false;
      }
    },
    setProp: (state, action: PayloadAction<SetPropParams>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone][index].props[action.payload.name] = action.payload.value;
      }
    },
    addMoney: (state, action: PayloadAction<AddMoneyParams>) => {
      state.players[action.payload.player].money += action.payload.money;
    },
  },
});

export const { endTurn, moveCard, createCard, setProp } = gameSlice.actions;
