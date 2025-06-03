import { CardEvaluation } from "../common/card";
import CardInfoCache from "../common/CardInfoCache";
import { GameState, PlayerId } from "../common/gameSlice";
import util, { canPayPlan, PlanProps } from "../common/util.js";

export function calculateTurn(cache: CardInfoCache, game: GameState, player: PlayerId): PlanProps[] {
  const currentPlan: PlanProps[] = [];

  while (true) {
    const evaluations: { plan: PlanProps; ev: CardEvaluation }[] = [];

    for (const card of util.filter(cache, game, {
      players: [player],
      zones: ["deck"],
    })) {
      if (canPayPlan(cache, game, player, currentPlan, { type: "play", card })) {
        const ev = cache.getCardInfo(game, card).evaluate?.();
        if (ev) {
          evaluations.push({ plan: { card, type: "play", action: { id: card.id, target: ev.target } }, ev });
        }
      }
    }

    for (const card of util.filter(cache, game, {
      players: [player],
      zones: ["board"],
    })) {
      if (canPayPlan(cache, game, player, currentPlan, { type: "activate", card })) {
        const ev = cache.getCardInfo(game, card).evaluateActivate?.();
        if (ev) {
          evaluations.push({ plan: { card, type: "activate", action: { id: card.id, target: ev.target } }, ev });
        }
      }
    }

    if (evaluations.length == 0) {
      return currentPlan;
    } else {
      currentPlan.push(evaluations[0].plan);
    }
  }
}
