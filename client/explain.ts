import CardInfoCache from "../common/CardInfoCache";
import { Target } from "../common/card";
import { GameState, PlayerId, findCard, getCard, isPlayerAction, opponentOf } from "../common/gameSlice";
import { CardKeyword } from "../common/keywords";
import util from "../common/util";

export interface Explanation {
  id: string;
  text: string;
  requirements: string[];
  relevantCards(cache: CardInfoCache, game: GameState, player: PlayerId, all?: boolean): Target[];
}

const baseRequirements = ["hand", "money", "agent", "operation", "activate", "win"];

class KeywordExplanation implements Explanation {
  get id() {
    return this.keyword;
  }

  requirements: string[] = baseRequirements;

  constructor(
    public keyword: CardKeyword[0],
    public text: string,
    public you: boolean = true,
    public opponent: boolean = true
  ) {}

  relevantCards(cache: CardInfoCache, game: GameState, player: PlayerId, all = false): Target[] {
    const cards: Target[] = [];

    if (this.you || all) {
      cards.push(
        ...util.filter(cache, game, {
          players: [player],
          zones: ["deck"],
          text: this.keyword,
        })
      );

      cards.push(
        ...util.filter(cache, game, {
          players: [player],
          zones: ["board"],
          text: this.keyword,
        })
      );
    }

    if (this.opponent || all) {
      cards.push(
        ...util.filter(cache, game, {
          players: [opponentOf(player)],
          text: this.keyword,
        })
      );
    }

    return cards;
  }
}

class SituationExplanation implements Explanation {
  constructor(
    public id: string,
    public text: string,
    public requirements: string[],
    public relevantCards: Explanation["relevantCards"]
  ) {}
}

export const keywordExplanations = [
  new KeywordExplanation("protected", "Protected agents prevent the first time they would be removed", false, true),
  new KeywordExplanation("disloyal", "Disloyal agents don't prevent you from losing the game", true, false),
  new KeywordExplanation("vip", "VIP agents cannot be targeted as long as you have a loyal agent on board"),
  new KeywordExplanation("delay", "Delay cards cannot be used for X turns after being played"),
  new KeywordExplanation("debt", "Debt cards subtract $X money two turns after being played"),
  new KeywordExplanation("depart", "Depart agents are removed after X turns in play"),
  new KeywordExplanation("tribute", "Tribute cards remove the lowest cost card in your deck when played"),
];

export const explanations = [
  new SituationExplanation(
    "hand",
    "Cards in your deck that you can currently play are shown in your hand",
    [],
    (cache, game, player) => util.filter(cache, game, { players: [player], zones: ["deck"] })
  ),
  new SituationExplanation(
    "money",
    "You gain $2 once each turn. You keep your money between turns.",
    [],
    (cache, game, player) =>
      game.history.find((x) => x.type == "game/addMoney" && x.payload.source == null)
        ? util.filter(cache, game, {
            players: [player],
            zones: ["deck"],
            minMoney: game.players[player].money - 2,
          })
        : []
  ),
  new SituationExplanation(
    "agent",
    "Agents stay on board and can be exhausted once each turn to pay for agent costs",
    ["hand"],
    (cache, game, player) => util.filter(cache, game, { players: [player], types: ["agent"], zones: ["board"] })
  ),
  new SituationExplanation(
    "operation",
    "Operations go to the grave immediately after being played",
    ["hand"],
    (cache, game, player) => util.filter(cache, game, { players: [player], types: ["operation"], zones: ["grave"] })
  ),
  new SituationExplanation(
    "activate",
    "Agents can be exhausted to activate their ability",
    ["agent"],
    (cache, game, player) => util.filter(cache, game, { players: [player], zones: ["board"] })
  ),
  new SituationExplanation(
    "win",
    "You win the game when you remove all of your opponent's agents",
    ["agent"],
    (cache, game, player) =>
      util.filter(cache, game, { players: [player], zones: ["deck"], text: "remove" })
  ),
  new SituationExplanation(
    "revealSelf",
    "Cards that affect your opponent reveal themselves",
    baseRequirements,
    (cache, game, player) =>
      game.history
        .filter((x) => x.type == "game/revealCard" && x.payload.source?.id == x.payload.target?.id)
        .map((x) => x.payload.target!)
        .filter((x) => cache.getCardInfo(game, getCard(game, x)!).type == "agent")
  ),
  new SituationExplanation(
    "revealPriority",
    "Reveal will prioritize your opponent's board, then deck, then grave",
    baseRequirements,
    (cache, game, player) => {
      const opponent = opponentOf(player);
      const history = [...game.history].reverse();
      const actionIndex = history.findIndex((action) => isPlayerAction(action));
      const refs = history
        .slice(0, actionIndex)
        .filter((action) => action.type == "game/revealCard")
        .map((reveal) => (reveal.payload.target ? findCard(game, reveal.payload.target) : null))
        .flatMap((x) => (x == null ? [] : [x]));
      if (
        refs.some((x) => x.player == opponent && x.zone == "board") &&
        refs.some((x) => x.player == opponent && x.zone != "board")
      ) {
        return refs.map((x) => game.players[x.player][x.zone][x.index]);
      } else {
        return [];
      }
    }
  ),
  new SituationExplanation(
    "doubleVIP",
    "VIP agents will not protect other VIP agents",
    baseRequirements,
    (cache, game, player) => {
      for (const player of [0, 1] as const) {
        const vipBoard = util.filter(cache, game, { players: [player], zones: ["board"], vip: true });
        const vipDeck = util.filter(cache, game, { players: [player], zones: ["deck"], vip: true });
        const otherBoard = util.filter(cache, game, {
          players: [player],
          zones: ["board"],
          vip: false,
          disloyal: false,
        });
        if (vipBoard.length > 0 && vipDeck.length > 0 && otherBoard.length == 0) {
          return [...vipBoard, ...vipDeck];
        }
      }
      return [];
    }
  ),
];

export function explain(cache: CardInfoCache, game: GameState, player: PlayerId): Explanation[] {
  return explanations.filter(
    (e) => e.relevantCards(cache, game, player).length > 0 && e.requirements.every((id) => isExplained({ id }))
  );
}

export function setExplained(explanation: { id: string }) {
  const explained = JSON.parse(localStorage.getItem("explained") ?? "[]") as string[];
  if (explained.find((id) => id == explanation.id) == null) {
    localStorage.setItem("explained", JSON.stringify([...explained, explanation.id]));
  }
}

export function isExplained(explanation: { id: string }) {
  return (JSON.parse(localStorage.getItem("explained") ?? "[]") as string[]).find((id) => id == explanation.id) != null;
}
