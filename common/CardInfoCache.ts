import { CardInfo, CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "./card.js";
import { GameState, findCard, getCard, initialGameState } from "./gameSlice.js";
import util from "./util.js";

export default abstract class CardInfoCache {
  info: Map<string, CardInfo> = new Map();
  valid: Set<string> = new Set();

  public reset() {
    this.valid.clear();
  }

  abstract getPartialCardInfoComputation(card: CardState): PartialCardInfoComputation;

  getDefaultCardInfo(card: CardState) {
    return this.getCardInfo(initialGameState(), card);
  }

  getCardInfo(game: GameState, card: CardState): CardInfo {
    if (this.info.has(card.id) && this.valid.has(card.id)) {
      return this.info.get(card.id)!;
    } else {
      this.valid.add(card.id);
      const baseInfo = runPartialCardInfoComputation(this.getPartialCardInfoComputation(card), util, this, game, card);
      this.info.set(card.id, baseInfo);
      const info = this.updateCardInfo(game, card, baseInfo);
      this.info.set(card.id, info);
      return info;
    }
  }

  updateCardInfo(game: GameState, state: CardState, info: CardInfo) {
    if (!findCard(game, state)) {
      return info;
    }

    this.info.set(state.id, info);

    for (const card of util.filter(this, game, { zones: ["board"] })) {
      const cardInfo = this.getCardInfo(game, card);
      if (util.filter(this, game, cardInfo.effectFilter).find((c) => c.id == state.id)) {
        info = { ...info, ...cardInfo.effect(info, state) };
        this.info.set(state.id, info);
      }

      if (util.filter(this, game, cardInfo.secondaryEffectFilter).find((c) => c.id == state.id)) {
        info = { ...info, ...cardInfo.secondaryEffect(info, state) };
        this.info.set(state.id, info);
      }
    }

    for (const modifier of state.modifiers) {
      const card = getCard(game, modifier.card);
      if (card) {
        const modifiers = this.getCardInfo(game, card).modifiers ?? {};
        info = { ...info, ...modifiers[modifier.name](info, modifier, state) };
        this.info.set(state.id, info);
      }
    }

    this.info.set(state.id, info);

    return info;
  }
}