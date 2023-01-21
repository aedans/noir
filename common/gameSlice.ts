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
  | TargetCardParams
  | NoActionParams
  | UndoneActionParams
  | MoveCardParams
  | AddCardParams
  | StealCardParams
  | SetPropParams
  | ChangeMoneyParams
);

export type TargetCardParams = {
  card: Target;
};

export type NoActionParams = {};

export type UndoneActionParams = {
  action: GameAction;
};

export type MoveCardParams = TargetCardParams & {
  to: PlayerZone;
};

export type AddCardParams = PlayerZone &
  TargetCardParams & {
    name: string;
    state?: Partial<CardState>;
  };

export type StealCardParams = TargetCardParams & {
  zone: Zone;
};

export type SetPropParams = TargetCardParams & {
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
    exhausted: true,
    protected: false,
    props: {},
    modifiers: [],
  };
}

export function opponentOf(player: PlayerId) {
  return player == 0 ? 1 : 0;
}

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? (0 as const) : (1 as const);
}

export function self(game: GameState, card: Target) {
  return findCard(game, card)?.player ?? currentPlayer(game);
}

export function opponent(game: GameState, card: Target) {
  return opponentOf(self(game, card));
}

export const gameReducers = {
  hidden: (state: GameState, action: PayloadAction<TargetCardParams>) => {
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
        state.players[player].grave.push(state.players[player][zone][index]);
        state.players[player][zone].splice(index, 1);
      }
    }
  },
  enterCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].board.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  bounceCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].deck.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  stealCard: (state: GameState, action: PayloadAction<StealCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.card);
    if (info) {
      const { player, zone, index } = info;
      state.players[opponentOf(player)][action.payload.zone].push(state.players[player][zone][index]);
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
  stealCard,
  revealCard,
  refreshCard,
  exhaustCard,
  protectCard,
  setProp,
  addMoney,
  removeMoney,
} = gameSlice.actions;
