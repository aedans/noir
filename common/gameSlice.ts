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
  | AddCardParams
  | TargetCardParams
  | SetPropParams
  | AddMoneyParams
);

export type MoveCardParams = {
  card: Target;
  to: PlayerZone;
};

export type AddCardParams = PlayerZone & {
  card: Target;
  name: string;
};

export type TargetCardParams = {
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

export function updateCard(game: GameState, card: Target, f: (card: CardState) => void) {
  const state = getCard(game, card);
  if (state) {
    f(state);
  }
}

export function defaultCardState(name: string, id: string): CardState {
  return {
    id, name,
    hidden: true,
    exhausted: false,
    props: {},
  };
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
    addCard: (state, action: PayloadAction<AddCardParams>) => {
      state.players[action.payload.player][action.payload.zone].push(defaultCardState(action.payload.name, action.payload.card.id));
    },
    removeCard: (state, action: PayloadAction<TargetCardParams>) => {
      const info = findCard(state, action.payload.card);
      if (info) {
        const { player, zone, index } = info;
        state.players[player][zone].splice(index, 1);
      }
    },
    revealCard: (state, action: PayloadAction<TargetCardParams>) => {
      updateCard(state, action.payload.card, (card) => (card.hidden = true));
    },
    refreshCard: (state, action: PayloadAction<TargetCardParams>) => {
      updateCard(state, action.payload.card, (card) => (card.exhausted = false));
    },
    exhaustCard: (state, action: PayloadAction<TargetCardParams>) => {
      updateCard(state, action.payload.card, (card) => (card.exhausted = true));
    },
    setProp: (state, action: PayloadAction<SetPropParams>) => {
      updateCard(state, action.payload.card, (card) => (card.props[action.payload.name] = action.payload.value));
    },
    addMoney: (state, action: PayloadAction<AddMoneyParams>) => {
      state.players[action.payload.player].money += action.payload.money;
    },
  },
});

export const { endTurn, moveCard, addCard, removeCard, revealCard, refreshCard, exhaustCard, setProp, addMoney } = gameSlice.actions;
