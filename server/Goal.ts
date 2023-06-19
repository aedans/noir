import { isEqual } from "lodash";
import { CardState } from "../common/card";
import { GameState, PlayerId, opponentOf } from "../common/gameSlice";
import { PlayerAction } from "../common/network";
import { Filter } from "../common/util";
import { defaultUtil } from "./card";

export type GoalState = {
  lastPlay: { [name: string]: number };
};

export type Goal = (game: GameState, player: PlayerId, state: GoalState) => PlayerAction | null;

export function runGoals(
  game: GameState,
  player: PlayerId,
  goals: Goal[],
  state: GoalState,
  invalid: PlayerAction[]
): PlayerAction | null {
  for (const goal of goals) {
    const action = goal(game, player, state);
    if (action != null && invalid.every(a => !isEqual(a, action))) {
      return action;
    }
  }

  return null;
}

export const playCard =
  (name: string, targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    const cache = new Map();
    const cards = defaultUtil.filter(cache, game, {
      names: [name],
      players: [player],
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
      ordering: ["money"],
      reversed: true,
      ...info.targets,
      ...targetFilter,
      players: [negative ? opponentOf(player) : player],
    });

    if (targets.length == 0) {
      return null;
    }

    state.lastPlay[name] = game.turn / 2;
    return { type: "do", id: card.id, prepared: [], target: targets[0] };
  };

export const activateCard =
  (name: string, targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (game: GameState, player: PlayerId) => {
    const cache = new Map();
    const cards = defaultUtil.filter(cache, game, {
      names: [name],
      players: [player],
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
      ordering: ["money"],
      reversed: true,
      ...info.activateTargets,
      ...targetFilter,
      players: [negative ? opponentOf(player) : player],
    });

    if (targets.length == 0) {
      return null;
    }

    return { type: "do", id: card.id, prepared: [], target: targets[0] };
  };

export const afterPlaying =
  (name: string, goal: Goal): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    return game.players[player].deck.some((x) => x.name == name) ? null : goal(game, player, state);
  };

export const afterLosing =
  (name: string, goal: Goal): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    return game.players[player].grave.some((x) => x.name == name) ? goal(game, player, state) : null;
  };

export const afterTurn =
  (turn: number, goal: Goal): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    return game.turn / 2 < turn ? null : goal(game, player, state);
  };

export const afterWait =
  (name: string, turns: number, goal: Goal): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    return !state.lastPlay[name] || game.turn / 2 > state.lastPlay[name] + turns ? goal(game, player, state) : null;
  };

export const when =
  (test: (cards: CardState[]) => boolean, who: "self" | "opponent" | "all", filter: Filter) =>
  (goal: Goal): Goal =>
  (game: GameState, player: PlayerId, state: GoalState) => {
    const cache = new Map();
    const ref = who == "opponent" ? opponentOf(player) : player;
    const players = who == "all" ? undefined : [ref];
    return test(defaultUtil.filter(cache, game, { players, ...filter })) ? goal(game, player, state) : null;
  };

export const seq = (goal: Goal, ...goals: ((goal: Goal) => Goal)[]): Goal => goals.reduce((goal, t) => t(goal), goal);

export const whenRevealLeft = when(lt(20), "opponent", { hidden: false });

export function lt(number: number) {
  return (cards: CardState[]) => cards.length < number;
}

export function gt(number: number) {
  return (cards: CardState[]) => cards.length > number;
}
