import CardInfoCache from "../common/CardInfoCache";
import { CardCost } from "../common/card";
import { GameState } from "../common/gameSlice";
import { PlayerAction } from "../common/network";
import util from "../common/util.js";

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
    const actions = [...this.getCardPlayActions(game, cache), ...this.getCardActivateActions(game, cache)]
      .filter(([_, action]) => invalid.every(x => JSON.stringify(action) != JSON.stringify(x)));

    let bestActionValue = this.settings.endTurnValue
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
      const info = cache.getCardInfo(game, card);
      const target = info.bestActivateTarget?.(this.settings);
      const evaluation = this.evaluateCost(info.cost) + info.evaluatePlay(this.settings, target);
      yield [evaluation, { type: "do", id: card.id, target }];
    }
  }

  *getCardActivateActions(game: GameState, cache: CardInfoCache): Generator<[number, PlayerAction]> {
    const player = util.currentPlayer(game);
    for (const card of util.filter(cache, game, { zones: ["board"], activatable: true, players: [player] })) {
      const info = cache.getCardInfo(game, card);
      const target = info.bestTarget?.(this.settings);
      const evaluation = this.evaluateCost(info.activateCost) + info.evaluateActivate(this.settings, target);
      yield [evaluation, { type: "do", id: card.id, target }];
    }
  }

  evaluateCost(cost: CardCost) {
    return cost.money + cost.agents * 2;
  }
}
