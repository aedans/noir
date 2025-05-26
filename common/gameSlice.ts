import * as toolkitRaw from "@reduxjs/toolkit";
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

import { CardState, CardType, ModifierState, Target } from "./card";
import { PayloadAction } from "@reduxjs/toolkit";

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

// export type GameAction = PayloadAction<GameParams, `game/${keyof typeof gameReducers}`>;
export type GameAction = PayloadAction<{ source: Target | undefined; target?: Target }> & (
  | PayloadAction<
      TargetParams,
      | "game/activateCard"
      | "game/removeCard"
      | "game/enterCard"
      | "game/bounceCard"
      | "game/refreshCard"
      | "game/exhaustCard"
    >
  | PayloadAction<NoActionParams, "game/endTurn" | "game/noop" | "game/reset">
  | PayloadAction<RevealCardParams, "game/revealCard">
  | PayloadAction<UndoneActionParams, "game/undone">
  | PayloadAction<AddCardParams, "game/addCard">
  | PayloadAction<PlayCardParams, "game/playCard">
  | PayloadAction<StealCardParams, "game/stealCard">
  | PayloadAction<SetPropParams, "game/setProp">
  | PayloadAction<ChangeMoneyParams, "game/addMoney" | "game/removeMoney">
  | PayloadAction<ModifyCardParams, "game/modifyCard">
);

export type GameParams =
  | TargetParams
  | NoActionParams
  | RevealCardParams
  | UndoneActionParams
  | AddCardParams
  | PlayCardParams
  | StealCardParams
  | SetPropParams
  | ChangeMoneyParams
  | ModifyCardParams;

export type SourceParams = {
  source: Target | undefined;
};

export type TargetParams = SourceParams & {
  target: Target;
};

export type NoActionParams = SourceParams & {};

export type UndoneActionParams = SourceParams & {
  action: GameAction;
};

export type AddCardParams = TargetParams & {
  zone: Zone;
  player: PlayerId;
  name: string;
};

export type PlayCardParams = TargetParams & {
  type: CardType;
};

export type StealCardParams = TargetParams & {
  zone: Zone;
};

export type RevealCardParams = TargetParams & {
  player: PlayerId;
  zone: Zone;
  target: CardState;
};

export type SetPropParams = TargetParams & {
  name: string;
  value: any;
};

export type ChangeMoneyParams = SourceParams & {
  player: PlayerId;
  money: number;
};

export type ModifyCardParams = TargetParams & {
  modifier: Omit<ModifierState, "props"> & Partial<Pick<ModifierState, "props">>;
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
  return state;
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

export function self(game: GameState, card: Target) {
  return findCard(game, card)?.player;
}

export function opponent(game: GameState, card: Target) {
  const player = self(game, card);
  return player == null ? null : opponentOf(player);
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
  noop: (state: GameState, action: PayloadAction<NoActionParams>) => {},
  reset: (state: GameState, action: PayloadAction<NoActionParams>) => {
    return initialGameState();
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
    const card = defaultCardState(action.payload.name, action.payload.target.id);
    if (action.payload.source) {
      card.hidden = getCard(state, action.payload.source)?.hidden ?? true;
    }
    state.players[action.payload.player][action.payload.zone].push(card);
  },
  playCard: (state: GameState, action: PayloadAction<PlayCardParams>) => {
    state.history.push(action as GameAction);
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
  activateCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.exhausted = true));
  },
  removeCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      const card = state.players[player][zone][index];
      state.players[player].grave.push(card);
      state.players[player][zone].splice(index, 1);
    }
  },
  enterCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player].board.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
      clearBoard(state, player);
    }
  },
  bounceCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player][zone][index].exhausted = true;
      state.players[player].deck.push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
    }
  },
  stealCard: (state: GameState, action: PayloadAction<StealCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[opponentOf(player)][action.payload.zone].push(state.players[player][zone][index]);
      state.players[player][zone].splice(index, 1);
      clearBoard(state, player);
    }
  },
  revealCard: (state: GameState, action: PayloadAction<RevealCardParams>) => {
    state.history.push(action as GameAction);
    const info = updateCard(state, action.payload.target, (card) => {
      Object.assign(card, action.payload.target);
      card.hidden = false;
    });
    if (!info) {
      state.players[action.payload.player][action.payload.zone].push({ ...action.payload.target, hidden: false });
    }
  },
  refreshCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.target, (card) => {
      card.exhausted = false;
    });
  },
  exhaustCard: (state: GameState, action: PayloadAction<TargetParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.exhausted = true));
  },
  setProp: (state: GameState, action: PayloadAction<SetPropParams>) => {
    state.history.push(action as GameAction);
    updateCard(state, action.payload.target, (card) => (card.props[action.payload.name] = action.payload.value));
  },
  addMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.push(action as GameAction);
    state.players[action.payload.player].money += Math.max(0, action.payload.money);
  },
  removeMoney: (state: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    state.history.push(action as GameAction);
    state.players[action.payload.player].money -= Math.max(0, action.payload.money);
  },
  modifyCard: (state: GameState, action: PayloadAction<ModifyCardParams>) => {
    state.history.push(action as GameAction);
    const info = findCard(state, action.payload.target);
    if (info) {
      const { player, zone, index } = info;
      state.players[player][zone][index].modifiers.push({ props: {}, ...action.payload.modifier });
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
  reset,
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
