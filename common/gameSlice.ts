import { createSlice, current, isDraft, PayloadAction } from "@reduxjs/toolkit";
import { CardState, Target } from "./card";

export const zones = ["deck", "board", "grave"] as const;
export type Zone = typeof zones[number];

export type PlayerId = 0 | 1;
export type PlayerState = { [zone in Zone]: CardState[] } & {
  money: number;
};

export type GameState = {
  history: GameAction[];
  players: [PlayerState, PlayerState];
  turn: number;
};

export type PlayerZone = {
  zone: Zone;
  player: PlayerId;
};

export function initialGameState(): GameState {
  return {
    history: [],
    players: [
      {
        money: 0,
        deck: [],
        board: [],
        grave: [],
      },
      {
        money: 0,
        deck: [],
        board: [],
        grave: [],
      },
    ],
    turn: 0,
  };
}

export type GameAction = PayloadAction<GameParams, `game/${keyof typeof gameReducers}`>;

export type GameParams = { card?: Target } & (
  | NoActionParams
  | HiddenActionParams
  | UndoneActionParams
  | MoveCardParams
  | AddCardParams
  | TargetCardParams
  | SetPropParams
  | ChangeMoneyParams
);

export type NoActionParams = {};

export type HiddenActionParams = {
  card: Target;
};

export type UndoneActionParams = {
  action: GameAction;
};

export type MoveCardParams = {
  card: Target;
  to: PlayerZone;
};

export type AddCardParams = PlayerZone & {
  card: Target;
  name: string;
  state?: Partial<CardState>;
};

export type TargetCardParams = {
  card: Target;
};

export type SetPropParams = {
  card: Target;
  name: string;
  value: any;
};

export type ChangeMoneyParams = {
  player: PlayerId;
  money: number;
};

export function findCard(game: GameState, card: Target) {
  if (!card) {
    return null;
  }

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
    id,
    name,
    hidden: true,
    exhausted: false,
    protected: false,
    props: {},
    modifiers: [],
  };
}

export const gameReducers = {
  hidden: (state: GameState, action: PayloadAction<HiddenActionParams>) => {
    state.history.push(action as GameAction);
  },
  undone: (state: GameState, action: PayloadAction<UndoneActionParams>) => {
    state.history.push(action as GameAction);
  },
  endTurn: (state: GameState, action: PayloadAction<NoActionParams>) => {
    state.history.push(action as GameAction);
    state.turn++;
  },
  addCard: (state: GameState, action: PayloadAction<AddCardParams>) => {
    state.history.push(action as GameAction);
    let cardState = defaultCardState(action.payload.name, action.payload.card.id);

    if (action.payload.state && isDraft(action.payload.state)) {
      Object.assign(cardState, current(action.payload.state));
    }

    state.players[action.payload.player][action.payload.zone].push(cardState);
  },
  removeCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      const card = state.players[player][zone][index];
      if (card.protected) {
        card.protected = false;
      } else {
        state.players[player].grave.push(state.players[info.player][info.zone][info.index]);
        state.players[player][zone].splice(index, 1);
      }
    }
  },
  enterCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].board.push(state.players[info.player][info.zone][info.index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  bounceCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].deck.push(state.players[info.player][info.zone][info.index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  revealCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.card, (card) => (card.hidden = false));
  },
  refreshCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.card, (card) => (card.exhausted = false));
  },
  exhaustCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.card, (card) => (card.exhausted = true));
  },
  protectCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.card, (card) => (card.protected = true));
  },
  setProp: (state: GameState, action: PayloadAction<SetPropParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.card, (card) => (card.props[action.payload.name] = action.payload.value));
  },
  addMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.push(action as GameAction);
    state.players[action.payload.player].money += Math.max(0, action.payload.money);
  },
  removeMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.push(action as GameAction);
    state.players[action.payload.player].money -= Math.max(0, action.payload.money);
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState(),
  reducers: gameReducers,
});

export const {
  endTurn,
  addCard,
  removeCard,
  enterCard,
  bounceCard,
  revealCard,
  refreshCard,
  exhaustCard,
  protectCard,
  setProp,
  addMoney,
  removeMoney,
} = gameSlice.actions;
