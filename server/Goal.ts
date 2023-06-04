import { GameState, PlayerId, opponentOf } from "../common/gameSlice";
import { PlayerAction } from "../common/network";
import { Filter } from "../common/util";
import { defaultUtil } from "./card";

export type GoalState = {
  lastPlay: { [name: string]: number };
};

export type Goal = (game: GameState, playerId: PlayerId, state: GoalState) => PlayerAction | null;

export function runGoals(game: GameState, playerId: PlayerId, goals: Goal[], state: GoalState): PlayerAction | null {
  for (const goal of goals) {
    const action = goal(game, playerId, state);
    if (action != null) {
      return action;
    }
  }

  return null;
}

export const playCard =
  (name: string, targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (game: GameState, playerId: PlayerId, state: GoalState) => {
    const cache = new Map();
    const cards = defaultUtil.filter(cache, game, {
      names: [name],
      players: [playerId],
      zones: ["deck"],
      playable: true,
      random: true,
    });

    if (cards.length == 0) {
      return null;
    }

    const [card] = cards;
    const info = defaultUtil.getCardInfo(cache, game, card);

    if (info.targets == null) {
      state.lastPlay[name] = game.turn / 2;
      return { type: "do", id: card.id, prepared: [] };
    }

    const targets = defaultUtil.filter(cache, game, {
      ...targetFilter,
      ...info.targets,
      players: [negative ? opponentOf(playerId) : playerId],
    });

    if (targets.length == 0) {
      return null;
    }

    state.lastPlay[name] = game.turn / 2;
    return { type: "do", id: card.id, prepared: [], target: targets[0] };
  };

export const activateCard =
  (name: string, targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (game: GameState, playerId: PlayerId) => {
    const cache = new Map();
    const cards = defaultUtil.filter(cache, game, {
      names: [name],
      players: [playerId],
      zones: ["board"],
      activatable: true,
      random: true,
    });

    if (cards.length == 0) {
      return null;
    }

    const [card] = cards;
    const info = defaultUtil.getCardInfo(cache, game, card);

    if (info.activateTargets == null) {
      return { type: "do", id: card.id, prepared: [] };
    }

    const targets = defaultUtil.filter(cache, game, {
      ...targetFilter,
      ...info.activateTargets,
      players: [negative ? opponentOf(playerId) : playerId],
    });

    if (targets.length == 0) {
      return null;
    }

    return { type: "do", id: card.id, prepared: [], target: targets[0] };
  };

export const afterPlaying =
  (name: string, goal: Goal): Goal =>
  (game: GameState, playerId: PlayerId, state: GoalState) => {
    return game.players[playerId].deck.some((x) => x.name == name) ? null : goal(game, playerId, state);
  };

export const afterLosing =
  (name: string, goal: Goal): Goal =>
  (game: GameState, playerId: PlayerId, state: GoalState) => {
    return game.players[playerId].grave.some((x) => x.name == name) ? goal(game, playerId, state) : null;
  };

export const afterTurn =
  (turn: number, goal: Goal): Goal =>
  (game: GameState, playerId: PlayerId, state: GoalState) => {
    return game.turn / 2 < turn ? null : goal(game, playerId, state);
  };

export const afterWait =
  (name: string, turns: number, goal: Goal): Goal =>
  (game: GameState, playerId: PlayerId, state: GoalState) => {
    return !state.lastPlay[name] || game.turn / 2 > state.lastPlay[name] + turns
      ? goal(game, playerId, state)
      : null;
  };
