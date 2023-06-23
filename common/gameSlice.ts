import * as toolkitRaw from "@reduxjs/toolkit";
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

import { CardState, CardType, ModifierState, Target } from "./card";
import { PayloadAction } from "@reduxjs/toolkit";

export const zones = ["deck", "board", "grave"] as const;
export type Zone = (typeof zones)[number];

export type PlayerId = 0 | 1;

export type Winner = PlayerId | "draw";

export type PlayerState = { [zone in Zone]: Target[] } & {
  money: number;
};

export type GameCardState = CardState & {
  player: PlayerId;
  zone: Zone;
};

export type GameState = {
  history: GameAction[];
  players: [PlayerState, PlayerState];
  cards: { [id: string]: GameCardState };
  turn: number;
};

export type PlayerZone = {
  zone: Zone;
  player: PlayerId;
};

export function initialGameState(): GameState {
  return {
    history: [],
    cards: {},
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

export function getCard(game: GameState, card: Target) {
  return card ? game.cards[card.id] : null;
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
  return getCard(game, card)?.player ?? currentPlayer(game);
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
  noop: (game: GameState, action: PayloadAction<{}>) => {},
  hidden: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
  },
  undone: (game: GameState, action: PayloadAction<UndoneActionParams>) => {
    game.history.unshift(action as GameAction);
  },
  endTurn: (game: GameState, action: PayloadAction<NoActionParams>) => {
    game.history.unshift(action as GameAction);
    game.turn++;
  },
  addCard: (game: GameState, action: PayloadAction<AddCardParams>) => {
    game.history.unshift(action as GameAction);
    const card = defaultCardState(action.payload.name, action.payload.target.id);
    if (action.payload.source) {
      card.hidden = getCard(game, action.payload.source)?.hidden ?? true;
    }
    game.cards[card.id] = {
      ...card,
      player: action.payload.player,
      zone: action.payload.zone,
    };
    game.players[action.payload.player][action.payload.zone].push({ id: card.id });
  },
  playCard: (game: GameState, action: PayloadAction<PlayCardParams>) => {
    game.history.unshift(action as GameAction);
    const state = getCard(game, action.payload.target);

    if (state) {
      const { player, zone } = state;
      if (action.payload.type == "operation") {
        game.players[player].grave.push({ id: state.id });
        game.cards[state.id].zone = "grave";
      } else {
        game.players[player].board.push({ id: state.id });
        game.cards[state.id].zone = "board";
        clearBoard(game, player);
      }
      game.players[player][zone] = game.players[player][zone].filter((x) => x.id != state.id);
    }
  },
  activateCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => (card.exhausted = true));
  },
  removeCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    const state = getCard(game, action.payload.target);
    if (state) {
      const { player, zone } = state;
      game.players[player].grave.push({ id: state.id });
      game.cards[state.id].zone = "grave";
      game.players[player][zone] = game.players[player][zone].filter((x) => x.id != state.id);
    }
  },
  enterCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    const state = getCard(game, action.payload.target);
    if (state) {
      const { player, zone } = state;
      game.players[player].board.push({ id: state.id });
      game.cards[state.id].zone = "board";
      game.players[player][zone] = game.players[player][zone].filter((x) => x.id != state.id);
      clearBoard(game, player);
    }
  },
  bounceCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    const state = getCard(game, action.payload.target);
    if (state) {
      const { player, zone } = state;
      updateCard(game, action.payload.target, (card) => (card.exhausted = false));
      game.players[player].deck.push({ id: state.id });
      game.cards[state.id].zone = "deck";
      game.players[player][zone] = game.players[player][zone].filter((x) => x.id != state.id);
    }
  },
  stealCard: (game: GameState, action: PayloadAction<StealCardParams>) => {
    game.history.unshift(action as GameAction);
    const state = getCard(game, action.payload.target);
    if (state) {
      const { player, zone } = state;
      game.players[opponentOf(player)][action.payload.zone].push({ id: state.id });
      game.cards[state.id].zone = action.payload.zone;
      game.cards[state.id].player = opponentOf(player);
      game.players[player][zone] = game.players[player][zone].filter((x) => x.id != state.id);
      clearBoard(game, player);
    }
  },
  revealCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => (card.hidden = false));
  },
  refreshCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => (card.exhausted = false));
  },
  exhaustCard: (game: GameState, action: PayloadAction<TargetCardParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => (card.exhausted = true));
  },
  setProp: (game: GameState, action: PayloadAction<SetPropParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => (card.props[action.payload.name] = action.payload.value));
  },
  addMoney: (game: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    game.history.unshift(action as GameAction);
    game.players[action.payload.player].money += Math.max(0, action.payload.money);
  },
  removeMoney: (game: GameState, action: PayloadAction<ChangeMoneyParams>) => {
    game.history.unshift(action as GameAction);
    game.players[action.payload.player].money -= Math.max(0, action.payload.money);
  },
  modifyCard: (game: GameState, action: PayloadAction<ModifyCardParams>) => {
    game.history.unshift(action as GameAction);
    updateCard(game, action.payload.target, (card) => card.modifiers.push(action.payload.modifier));
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
