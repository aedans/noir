import CardInfoCache from "../common/CardInfoCache";
import { CardCost, CardFactor, CardState, CardTargetEvaluator, Target } from "../common/card";
import { GameState, currentPlayer, findCard } from "../common/gameSlice.js";
import { PlayerAction } from "../common/network";
import util, { Filter } from "../common/util.js";

export type AISettings = {
  agentCostValue: number;
  endTurnValue: number;
};

export default class AI {
  settings: AISettings;

  constructor(settings: Partial<AISettings>) {
    this.settings = Object.assign(
      {
        agentCostValue: 2,
        endTurnValue: 0,
      } as AISettings,
      settings
    );
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
      yield [evaluation, { type: "do", id: card.id, target }];
    }
  }

  evaluateCardPlay(
    game: GameState,
    card: CardState,
    cache: CardInfoCache,
    depth: number = 0
  ): [number, Target | undefined] {
    const info = cache.getCardInfo(game, card);
    const target = this.bestTarget(info.targets, info.evaluateTarget, info.factor, game, cache, depth);
    const evaluation = this.evaluateCost(info.cost) + info.evaluate(this.settings, target);
    return [evaluation, target];
  }

  *getCardActivateActions(game: GameState, cache: CardInfoCache): Generator<[number, PlayerAction]> {
    const player = util.currentPlayer(game);
    for (const card of util.filter(cache, game, { zones: ["board"], activatable: true, players: [player] })) {
      const [evaluation, target] = this.evaluateCardActivate(game, card, cache);
      yield [evaluation, { type: "do", id: card.id, target }];
    }
  }

  evaluateCardActivate(
    game: GameState,
    card: CardState,
    cache: CardInfoCache,
    depth: number = 0
  ): [number, Target | undefined] {
    const info = cache.getCardInfo(game, card);
    const target = this.bestTarget(
      info.activateTargets,
      info.evaluateActivateTarget,
      info.activateFactor,
      game,
      cache,
      depth
    );
    const evaluation = this.evaluateCost(info.activateCost) + info.evaluateActivate(this.settings, target);
    return [evaluation, target];
  }

  bestTarget(
    targets: Filter | undefined,
    targeter: CardTargetEvaluator,
    factor: CardFactor,
    game: GameState,
    cache: CardInfoCache,
    depth: number
  ): Target | undefined {
    if (targets == undefined || depth >= 1) {
      return undefined;
    } else {
      let bestTarget: Target | undefined = undefined;
      let bestEval = 0;
      for (const target of util.filter(cache, game, targets)) {
        const { zone, player } = findCard(game, target)!;
        let evaluation = targeter(this.settings, target);
        if (zone == "deck") {
          evaluation += this.evaluateCardPlay(game, target, cache, depth + 1)[0];
        } else if (zone == "board") {
          evaluation += this.evaluateCardActivate(game, target, cache, depth + 1)[0];
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

      return bestTarget;
    }
  }

  evaluateCost(cost: CardCost) {
    return cost.money + cost.agents * 2;
  }
}
