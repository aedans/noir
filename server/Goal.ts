import _ from "lodash";
import { CardColor, CardState } from "../common/card.js";
import { GameState, PlayerId, opponentOf } from "../common/gameSlice.js";
import { PlayerAction } from "../common/network.js";
import util, { Filter } from "../common/util.js";
import CardInfoCache from "../common/CardInfoCache.js";

export type GoalState = {
  lastPlay: { [name: string]: number };
};

export type Goal = (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => PlayerAction | null;

export function runGoals(
  cache: CardInfoCache,
  game: GameState,
  player: PlayerId,
  goals: Goal[],
  state: GoalState,
  invalid: PlayerAction[]
): PlayerAction | null {
  for (const goal of goals) {
    const action = goal(cache, game, player, state);
    if (action != null && invalid.every((a) => !_.isEqual(a, action))) {
      return action;
    }
  }

  return null;
}

export const playCard =
  (name: string | string[], targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    const names = typeof name == "string" ? [name] : name;
    const cards = util.filter(cache, game, {
      names,
      players: [player],
      zones: ["deck"],
      playable: true,
      random: true,
    });

    if (cards.length == 0) {
      return null;
    }

    cards.sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));

    const [card] = cards;
    const info = cache.getCardInfo(game, card);

    if (info.targets == null) {
      state.lastPlay[card.name] = game.turn / 2;
      return { type: "do", id: card.id, prepared: [] };
    }

    const targets = util.filter(cache, game, {
      ordering: ["money"],
      reversed: true,
      ...info.targets,
      ...targetFilter,
      players: [negative ? opponentOf(player) : player],
    });

    if (targets.length == 0) {
      return null;
    }

    state.lastPlay[card.name] = game.turn / 2;
    return { type: "do", id: card.id, prepared: [], target: targets[0] };
  };

export const activateCard =
  (name: string, targetFilter: Filter = { ordering: ["money"] }, negative: boolean = false): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId) => {
    const names = typeof name == "string" ? [name] : name;
    const cards = util.filter(cache, game, {
      names: names,
      players: [player],
      zones: ["board"],
      activatable: true,
      random: true,
    });

    if (cards.length == 0) {
      return null;
    }

    const [card] = cards;
    const info = cache.getCardInfo(game, card);

    if (info.activateTargets == null) {
      return { type: "do", id: card.id, prepared: [] };
    }

    const targets = util.filter(cache, game, {
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

export const when =
  (test: (cards: CardState[]) => boolean, who: "self" | "opponent" | "all", filter: Filter) =>
  (goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    const ref = who == "opponent" ? opponentOf(player) : player;
    const players = who == "all" ? undefined : [ref];
    return test(util.filter(cache, game, { players, ...filter })) ? goal(cache, game, player, state) : null;
  };

export const seq = (goal: Goal, ...goals: ((goal: Goal) => Goal)[]): Goal => goals.reduce((goal, t) => t(goal), goal);

export const afterPlaying =
  (name: string, goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    return game.players[player].deck.some((x) => x.name == name) ? null : goal(cache, game, player, state);
  };

export const afterLosing =
  (name: string, goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    return game.players[player].grave.some((x) => x.name == name) ? goal(cache, game, player, state) : null;
  };

export const afterTurn =
  (turn: number, goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    return game.turn / 2 < turn ? null : goal(cache, game, player, state);
  };

export const afterWait =
  (name: string, turns: number, goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    return !state.lastPlay[name] || game.turn / 2 > state.lastPlay[name] + turns
      ? goal(cache, game, player, state)
      : null;
  };

export const onRemovalTurn =
  (goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    const index = game.history.findIndex((action) => action.type == "game/endTurn");
    const actions = game.history.slice(0, index);
    const removals = actions.filter((action) => action.type == "game/removeCard").length;
    return removals > 0 ? goal(cache, game, player, state) : null;
  };

export const whenMoney =
  (cmp: "lt" | "gt", number: number, goal: Goal): Goal =>
  (cache: CardInfoCache, game: GameState, player: PlayerId, state: GoalState) => {
    const compares = {
      lt: (a: number, b: number) => a < b,
      gt: (a: number, b: number) => a > b,
    } as const;
    return compares[cmp](game.players[player].money, number) ? goal(cache, game, player, state) : null;
  };

export const whenRevealLeft = when(lt(20), "opponent", { hidden: false });

export const whenNotInPlay = (name: string, goal: Goal) =>
  when(eq(0), "self", { names: [name], zones: ["board"] })(goal);

export const coloredAgents: Filter = { zones: ["board"], types: ["agent"], colors: ["purple"], activatable: false };

export const basicAgents = (colors: CardColor[]): Filter => ({
  colors,
  zones: ["board"],
  types: ["agent"],
  hasActivate: false,
});

export function lt(number: number) {
  return (cards: CardState[]) => cards.length < number;
}

export function gt(number: number) {
  return (cards: CardState[]) => cards.length > number;
}

export function eq(number: number) {
  return (cards: CardState[]) => cards.length == number;
}
