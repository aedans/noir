import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState, CardType, ModifierState, Target } from "./card";

export const zones = ["deck", "board", "grave"] as const;
export type Zone = (typeof zones)[number];

export type PlayerId = 0 | 1;

export type Winner = PlayerId | "draw";

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
        money: 5,
        deck: [],
        board: [],
        grave: [],
      },
      {
        money: 6,
        deck: [],
        board: [],
        grave: [],
      },
    ],
    turn: 0,
  };
}

export type GameAction = PayloadAction<GameParams, `game/${keyof typeof gameReducers}`>;

export type GameParams = Partial<TargetCardParams> &
  (
    | NoActionParams
    | UndoneActionParams
    | AddCardParams
    | PlayCardParams
    | StealCardParams
    | SetPropParams
    | ChangeMoneyParams
    | ModifyCardParams
  );

export type TargetCardParams = {
  source?: Target;
  target: Target;
};

export type NoActionParams = {};

export type UndoneActionParams = {
  action: GameAction;
};

export type AddCardParams = PlayerZone &
  TargetCardParams & {
    name: string;
  };

export type PlayCardParams = TargetCardParams & {
  type: CardType;
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

export type ModifyCardParams = TargetCardParams & {
  modifier: ModifierState;
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

export function isPlayerAction(action: PayloadAction<{}>) {
  return action.type == "game/endTurn" || action.type == "game/playCard" || action.type == "game/activateCard";
}

function clearBoard(state: GameState, player: PlayerId) {
  // while (state.players[player].board.length > 8) {
  //   state.players[player].grave.push(state.players[player].board[0]);
  //   state.players[player].board = state.players[player].board.slice(1);
  // }
}

export const gameReducers = {
  noop: (state: GameState, action: PayloadAction<{}>) => {},
  hidden: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
  },
  undone: (state: GameState, action: PayloadAction<UndoneActionParams>) => {
    state.history.unshift(action as GameAction);
  },
  endTurn: (state: GameState, action: PayloadAction<NoActionParams>) => {
    state.history.unshift(action as GameAction);
    state.turn++;
  },
  addCard: (state: GameState, action: PayloadAction<AddCardParams>) => {
    state.history.unshift(action as GameAction);
    const card = defaultCardState(action.payload.name, action.payload.target.id);
    if (action.payload.source) {
      card.hidden = getCard(state, action.payload.source)?.hidden ?? true;
    }
    state.players[action.payload.player][action.payload.zone].push(card);
  },
  playCard: (state: GameState, action: PayloadAction<PlayCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);

    if (info) {
      const { player, zone, index } = info;
      const card = state.players[player][zone][index];
      if (action.payload.type == "operation") {
        state.players[player].grave.push(card);
      } else {
        state.players[player].board.push(card);
        clearBoard(state, player);
      }
      state.players[player][zone].splice(index, 1);
    }
  },
  activateCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.exhausted = true));
  },
  removeCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      const card = state.players[player][zone][index];
      state.players[player].grave.push(card);
      state.players[player][zone].splice(index, 1);
    }
  },
  enterCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].board.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
      clearBoard(state, player);
    }
  },
  bounceCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player][zone][index].exhausted = true;
      state.players[player].deck.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  stealCard: (state: GameState, action: PayloadAction<StealCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[opponentOf(player)][action.payload.zone].push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
      clearBoard(state, player);
    }
  },
  revealCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.hidden = false));
  },
  refreshCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.exhausted = false));
  },
  exhaustCard: (state: GameState, action: PayloadAction<TargetCardParams>) => {
    state.history.unshift(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.exhausted = true));
  },
  setProp: (state: GameState, action: PayloadAction<SetPropParams>) => {
    state.history.unshift(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.props[action.payload.name] = action.payload.value));
  },
  addMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.unshift(action as GameAction);
    state.players[action.payload.player].money += Math.max(0, action.payload.money);
  },
  removeMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.unshift(action as GameAction);
    state.players[action.payload.player].money -= Math.max(0, action.payload.money);
  },
  modifyCard: (state: GameState, action: PayloadAction<ModifyCardParams>) => {
    state.history.unshift(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player][zone][index].modifiers.push(action.payload.modifier);
    }
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState(),
  reducers: gameReducers,
});

export const {
  noop,
  endTurn,
  addCard,
  playCard,
  activateCard,
  removeCard,
  enterCard,
  bounceCard,
  stealCard,
  revealCard,
  refreshCard,
  exhaustCard,
  setProp,
  addMoney,
  removeMoney,
  modifyCard,
} = gameSlice.actions;
