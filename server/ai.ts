import { CardCost, CardEvaluation, CardState, Target } from "../common/card";
import CardInfoCache from "../common/CardInfoCache";
import { findCard, GameState, PlayerId } from "../common/gameSlice.js";
import util, { canPayPlan, Filter, PlanProps, Util } from "../common/util.js";

export const defaultAIValues = {
  cost: {
    money: 1,
    agent: 1,
  },
  agent: {
    orange: 1,
    blue: 1,
    green: 1,
    purple: 1,
  },
  reveal: {
    any: 1,
    hand: 1,
    deck: 1,
    board: 1,
  },
  time: 3,
};

export type AIValues = typeof defaultAIValues;

export function calculateTurn(cache: CardInfoCache, game: GameState, player: PlayerId, ai: AIValues): PlanProps[] {
  const currentPlan: PlanProps[] = [];

  while (true) {
    const evaluations: { plan: PlanProps; ev: CardEvaluation }[] = [];
    const excludes: Target[] = currentPlan.map((x) => x.card);

    for (const card of util.filter(cache, game, {
      players: [player],
      zones: ["deck"],
      excludes,
    })) {
      if (canPayPlan(cache, game, player, currentPlan, { type: "play", card })) {
        const ev = cache.getCardInfo(game, card).evaluate?.(ai);
        const costValue = evaluateCost(ai, cache.getCardInfo(game, card).cost);
        const baseValue = evaluateBase(ai, cache, game, card);
        if (ev) {
          evaluations.push({
            plan: { card, type: "play", action: { id: card.id, target: ev.target } },
            ev: { target: ev.target, value: ev.value - costValue + baseValue },
          });
        }
      }
    }

    for (const card of util.filter(cache, game, {
      players: [player],
      zones: ["board"],
      excludes,
    })) {
      if (canPayPlan(cache, game, player, currentPlan, { type: "activate", card })) {
        const ev = cache.getCardInfo(game, card).evaluateActivate?.(ai);
        const costValue = evaluateCost(ai, cache.getCardInfo(game, card).activateCost);
        const baseValue = evaluateBase(ai, cache, game, card);
        if (ev) {
          evaluations.push({
            plan: { card, type: "activate", action: { id: card.id, target: ev.target } },
            ev: { target: ev.target, value: ev.value - costValue + baseValue },
          });
        }
      }
    }

    if (evaluations.length == 0) {
      return currentPlan;
    } else {
      const ready = util.filter(cache, game, {
        players: [player],
        zones: ["board"],
        types: ["agent"],
        exhausted: false,
      });
      let maxEvaluation: { plan?: PlanProps; ev: CardEvaluation } = { ev: { value: ready.length * -ai.cost.agent } };
      for (const evaluation of evaluations) {
        if (evaluation.ev.value >= maxEvaluation.ev.value) {
          maxEvaluation = evaluation;
        }
      }

      if (maxEvaluation.plan) {
        currentPlan.push(maxEvaluation.plan);
      } else {
        return currentPlan;
      }
    }
  }
}

export function evaluateCost(ai: AIValues, cost: CardCost) {
  return cost.money * ai.cost.money + cost.agents * ai.cost.agent;
}

export function evaluateBase(ai: AIValues, cache: CardInfoCache, game: GameState, card: CardState) {
  let value = 0;
  const info = cache.getCardInfo(game, card);

  if (info.type == "agent") {
    let agentValue = ai.cost.agent;
    for (const color of info.colors) {
      agentValue += ai.agent[color];
    }

    const activateValue = info.evaluateActivate?.(ai)?.value ?? 0;
    value += Math.max(agentValue, activateValue) * ai.time;
  }

  return value;
}

export function evaluateCard(ai: AIValues, cache: CardInfoCache, game: GameState, card: CardState) {
  const zone = findCard(game, card)!.zone;
  const info = cache.getCardInfo(game, card);
  if (zone == "deck") {
    return evaluateBase(ai, cache, game, card) - evaluateCost(ai, info.cost);
  } else if (zone == "board") {
    return evaluateBase(ai, cache, game, card);
  } else {
    return 0;
  }
}

export function bestTarget(
  this: Util,
  ai: AIValues,
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  filter: Filter
) {
  const info = cache.getCardInfo(game, card);
  const cards = this.filter(cache, game, { ...info.targets!, ...filter });
  if (cards.length == 0) {
    return undefined;
  }

  let maxCard = cards[0];
  let maxEval = evaluateCard(ai, cache, game, cards[0]);
  for (const card of cards) {
    const ev = evaluateCard(ai, cache, game, card);
    if (ev > maxEval) {
      maxEval = ev;
      maxCard = card;
    }
  }

  return { target: maxCard, value: maxEval };
}
