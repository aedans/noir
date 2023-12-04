import CardInfoCache from "../common/CardInfoCache";
import { CardColor, CardCost, CardEvaluator, CardFactor, CardState, Target } from "../common/card";
import { GameState, currentPlayer, findCard, getCard } from "../common/gameSlice.js";
import { PlayerAction } from "../common/network";
import util, { Filter } from "../common/util.js";

export type AISettings = {
  endTurnValue: number;
  agentCostValueFactor: number;
  agentValue: number;
  activateValueFactor: number;
  removeValue: number;
  removeValueFactor: number;
  removeProtectedValueFactor: number;
  stealValue: number;
  stealValueFactor: number;
  revealValue: number;
  revealDeckValue: number;
  debtValue: number;
  delayValue: number;
  departValue: number;
  tributeValue: number;
  disloyalValue: number;
  vipValueFactor: number;
  protectedValueFactor: number;
} & {
  [color in CardColor as `${color}AgentValue`]: number;
};

export default class AI {
  settings: AISettings;

  constructor(settings: Partial<AISettings>) {
    const defaultSettings: AISettings = {
      endTurnValue: -0.01,
      agentCostValueFactor: 2,
      agentValue: 4,
      activateValueFactor: 1.5,
      removeValue: 0.01,
      removeValueFactor: 1,
      removeProtectedValueFactor: 0.5,
      stealValue: 0.01,
      stealValueFactor: 2,
      revealValue: 1,
      revealDeckValue: 0.5,
      debtValue: -0.5,
      delayValue: -1,
      departValue: -4,
      tributeValue: -2,
      disloyalValue: -1,
      vipValueFactor: 1.5,
      protectedValueFactor: 1.5,
      blueAgentValue: 1,
      orangeAgentValue: 1,
      greenAgentValue: 1,
      purpleAgentValue: 1,
    };

    this.settings = Object.assign(defaultSettings, settings);
  }

  bestAction(game: GameState, cache: CardInfoCache, invalid: PlayerAction[]): PlayerAction {
    const actions = [...this.getCardPlayActions(game, cache), ...this.getCardActivateActions(game, cache)].filter(
      ([_, action]) => invalid.every((x) => JSON.stringify(action) != JSON.stringify(x))
    );

    let bestActionValue = this.settings.endTurnValue;
    let bestAction: PlayerAction = { type: "end" };
    for (const [value, action] of actions) {
      if (value > bestActionValue) {
        bestActionValue = value;
        bestAction = action;
      }
    }

    return bestAction;
  }

  *getCardPlayActions(game: GameState, cache: CardInfoCache): Generator<[number, PlayerAction]> {
    const player = util.currentPlayer(game);
    for (const card of util.filter(cache, game, { zones: ["deck"], playable: true, players: [player] })) {
      const [evaluation, target] = this.evaluateCardPlay(game, card, cache);
      yield [evaluation / this.evaluateCost(cache.getCardInfo(game, card).cost), { type: "do", id: card.id, target }];
    }
  }

  evaluateCardPlay(
    game: GameState,
    card: CardState,
    cache: CardInfoCache,
    depth: number = 0
  ): [number, Target | undefined] {
    const info = cache.getCardInfo(game, card);
    let [evaluation, target] = this.evaluateWithTargets(info.targets, info.evaluate, info.factor, game, cache, depth);

    if (info.type == "agent") {
      evaluation += this.settings.agentValue;

      for (const color of info.colors) {
        evaluation += this.settings[`${color}AgentValue`];
      }

      evaluation += this.evaluateCardActivate(game, card, cache, depth)[0] * this.settings.activateValueFactor;
    }

    for (const keyword of info.keywords) {
      if (keyword[0] == "debt") {
        evaluation += keyword[1] * this.settings.debtValue;
      }

      if (keyword[0] == "delay") {
        evaluation += keyword[1] * this.settings.delayValue;
      }

      if (keyword[0] == "depart") {
        evaluation += (1 / keyword[1]) * this.settings.departValue;
      }

      if (keyword[0] == "tribute") {
        evaluation += this.settings.tributeValue;
      }

      if (keyword[0] == "disloyal") {
        evaluation += this.settings.disloyalValue;
      }

      if (keyword[0] == "vip") {
        evaluation *= this.settings.vipValueFactor;
      }

      if (keyword[0] == "protected") {
        evaluation *= this.settings.protectedValueFactor;
      }
    }

    return [evaluation, target];
  }

  *getCardActivateActions(game: GameState, cache: CardInfoCache): Generator<[number, PlayerAction]> {
    const player = util.currentPlayer(game);
    for (const card of util.filter(cache, game, { zones: ["board"], activatable: true, players: [player] })) {
      const [evaluation, target] = this.evaluateCardActivate(game, card, cache);
      yield [evaluation / this.evaluateCost(cache.getCardInfo(game, card).activateCost), { type: "do", id: card.id, target }];
    }
  }

  evaluateCardActivate(
    game: GameState,
    card: CardState,
    cache: CardInfoCache,
    depth: number = 0
  ): [number, Target | undefined] {
    const info = cache.getCardInfo(game, card);
    return this.evaluateWithTargets(
      info.activateTargets,
      info.evaluateActivate,
      info.activateFactor,
      game,
      cache,
      depth
    );
  }

  evaluateWithTargets(
    targets: Filter | undefined,
    evaluator: CardEvaluator,
    factor: CardFactor,
    game: GameState,
    cache: CardInfoCache,
    depth: number
  ): [number, Target | undefined] {
    if (targets == undefined || depth >= 1) {
      return [evaluator(this, undefined)[0], undefined];
    } else {
      let bestTarget: Target | undefined = undefined;
      let bestEval = 0;
      for (const target of util.filter(cache, game, targets)) {
        const { zone, player } = findCard(game, target)!;
        let [evaluation, evaluationFactor] = evaluator(this, target);
        if (zone == "deck" && evaluationFactor > 0) {
          evaluation += evaluationFactor * this.evaluateCardPlay(game, target, cache, depth + 1)[0];
        } else if (zone == "board" && evaluationFactor > 0) {
          evaluation += evaluationFactor * this.evaluateCardActivate(game, target, cache, depth + 1)[0];
        }

        if (factor == "positive") {
          evaluation *= player == currentPlayer(game) ? 1 : -1;
        } else if (factor == "negative") {
          evaluation *= player == currentPlayer(game) ? -1 : 1;
        }

        if (evaluation > bestEval) {
          bestEval = evaluation;
          bestTarget = target;
        }
      }

      return [bestEval, bestTarget];
    }
  }

  evaluateRemove(game: GameState, cache: CardInfoCache, target: Target | undefined): [number, number] {
    if (target == undefined) {
      return [this.settings.removeValue, this.settings.removeValueFactor];
    } else {
      const state = getCard(game, target)!;
      const info = cache.getCardInfo(game, state);

      let { removeValue, removeValueFactor } = this.settings;

      if (info.keywords.some((x) => x[0] == "protected")) {
        removeValueFactor *= this.settings.removeProtectedValueFactor;
      }

      return [removeValue, removeValueFactor];
    }
  }

  evaluateCost(cost: CardCost) {
    return cost.money + cost.agents * this.settings.agentCostValueFactor;
  }
}
