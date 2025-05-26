import CardInfoCache from "./CardInfoCache";
import { CardInfo, CardState, CardType, Target } from "./card";
import {
  GameAction,
  GameState,
  activateCard,
  enterCard,
  exhaustCard,
  findCard,
  removeCard,
  removeMoney,
  self,
  setProp,
} from "./gameSlice.js";
import util from "./util.js";

export const cardKeywords = {
  disloyal: () => ["disloyal"] as const,
  protected: () => ["protected"] as const,
  vip: () => ["vip"] as const,
  delay: (n?: number) => ["delay", n ?? 0] as const,
  debt: (n?: number) => ["debt", n ?? 0] as const,
  depart: (n?: number) => ["depart", n ?? 0] as const,
  tribute: (n?: CardType) => ["tribute", n ?? "card"] as const,
} as const;

export type CardKeywordName = keyof typeof cardKeywords;
export type CardKeyword = ReturnType<(typeof cardKeywords)[CardKeywordName]>;

export type CardKeywordEffect = (
  cache: CardInfoCache,
  game: GameState,
  state: CardState,
  keyword: CardKeyword,
  info: CardInfo
) => CardInfo;

export const cardKeywordEffects: { [name in CardKeywordName]: CardKeywordEffect } = {
  disloyal: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return info;
  },
  protected: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return {
      ...info,
      *onTarget(action: GameAction) {
        if (state.props.protected != false && action.type == "game/removeCard") {
          yield setProp({
            source: state,
            target: state,
            name: "protected",
            value: false,
          });

          return true;
        }

        return yield* info.onTarget(action);
      },
    };
  },
  vip: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return info;
  },
  delay: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return {
      ...info,
      *play(target: Target) {
        if (info.type == "operation") {
          yield enterCard({ source: state, target: state });
        } else {
          yield* info.play(target);
        }

        yield setProp({ source: state, target: state, name: "delayed", value: keyword[1] as number });
      },
      *turn() {
        yield* info.turn();

        if (state.props.delayed == 0) {
          yield setProp({
            source: state,
            target: state,
            name: "delayed",
            value: undefined,
          });

          if (info.type == "operation") {
            yield removeCard({ source: state, target: state });
            yield* info.play(state.props.target);
          }
        } else if (state.props.delayed != undefined) {
          yield setProp({
            source: state,
            target: state,
            name: "delayed",
            value: state.props.delayed - 1,
          });

          yield exhaustCard({ source: state, target: state });
          yield activateCard({ source: state, target: state });
        }
      },
    };
  },
  debt: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return {
      ...info,
      *play(target: Target) {
        yield* info.play(target);

        yield setProp({ source: state, target: state, name: "collection", value: 2 });

        if (info.type == "operation") {
          yield enterCard({ source: state, target: state });
        }
      },
      *turn() {
        yield* info.turn();

        if (state.props.collection == 0) {
          yield setProp({
            source: state,
            target: state,
            name: "collection",
            value: undefined,
          });

          const player = findCard(game, state)!.player;
          yield removeMoney({ source: state, player, money: keyword[1] as number });

          if (info.type == "operation") {
            yield removeCard({ source: state, target: state });
          }
        } else if (state.props.collection != undefined) {
          yield setProp({
            source: state,
            target: state,
            name: "collection",
            value: state.props.collection - 1,
          });
        }
      },
    };
  },
  depart: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return {
      ...info,
      *play(target: Target) {
        yield* info.play(target);

        yield setProp({
          source: state,
          target: state,
          name: "departing",
          value: keyword[1] as number,
        });
      },
      *turn() {
        yield* info.turn();

        if (state.props.departing == 0) {
          yield setProp({
            source: state,
            target: state,
            name: "departing",
            value: undefined,
          });

          yield removeCard({ source: state, target: state });
        } else if (state.props.departing != undefined) {
          yield setProp({
            source: state,
            target: state,
            name: "departing",
            value: state.props.departing - 1,
          });
        }
      },
    };
  },
  tribute: function (
    cache: CardInfoCache,
    game: GameState,
    state: CardState,
    keyword: CardKeyword,
    info: CardInfo
  ): CardInfo {
    return {
      ...info,
      *play(target: Target) {
        const totalTribute = {
          cards: info.keywords.filter(([name, type]) => name == "tribute" && type == "card").length,
          agents: info.keywords.filter(([name, type]) => name == "tribute" && type == "agent").length,
          operations: info.keywords.filter(([name, type]) => name == "tribute" && type == "operation").length,
        };

        const player = self(game, state)!
        const lowestCards = util.filter(cache, game, {
          players: [player],
          zones: ["deck"],
          types: ["operation"],
          random: true,
          ordering: ["money"],
          excludes: [state],
        });

        const lowestAgents = util.filter(cache, game, {
          players: [player],
          zones: ["deck"],
          types: ["agent"],
          random: true,
          ordering: ["money"],
          excludes: [state],
        });

        const lowestOperations = util.filter(cache, game, {
          players: [player],
          zones: ["deck"],
          types: ["operation"],
          random: true,
          ordering: ["money"],
          excludes: [state],
        });

        if (lowestCards.length < totalTribute.cards) {
          throw "Not enough cards to tribute";
        }

        if (lowestAgents.length < totalTribute.agents) {
          throw "Not enough agents to tribute";
        }

        if (lowestOperations.length < totalTribute.operations) {
          throw "Not enough operations to tribute";
        }

        yield* info.play(target);

        for (const target of [
          ...lowestCards.slice(0, totalTribute.cards),
          ...lowestAgents.slice(0, totalTribute.agents),
          ...lowestOperations.slice(0, totalTribute.operations),
        ]) {
          yield removeCard({ source: state, target });
        }
      },
    };
  },
};
