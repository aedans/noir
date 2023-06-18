import { CardKeyword, Target } from "../common/card";
import { GameState, PlayerId, findCard, isPlayerAction, opponentOf } from "../common/gameSlice";
import { CardInfoCache } from "../common/util";
import { defaultUtil } from "./cards";

export interface Explanation {
  id: string;
  text: string;
  requirements: string[];
  relevantCards(cache: CardInfoCache, game: GameState, player: PlayerId): Target[];
}

const baseRequirements = ["hand", "money", "reveal", "agents", "operations", "win", "revealed", "revealSelf"];

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

  relevantCards(cache: CardInfoCache, game: GameState, player: PlayerId): Target[] {
    const cards: Target[] = [];

    if (this.you) {
      cards.push(
        ...defaultUtil.filter(cache, game, {
          players: [player],
          zones: ["deck"],
          playable: true,
          text: this.keyword,
        })
      );

      cards.push(
        ...defaultUtil.filter(cache, game, {
          players: [player],
          zones: ["board"],
          text: this.keyword,
        })
      );
    }

    if (this.opponent) {
      cards.push(
        ...defaultUtil.filter(cache, game, {
          players: [opponentOf(player)],
          hidden: false,
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

export const explanations = [
  new SituationExplanation(
    "hand",
    "Cards in your deck that you can currently play are shown in your hand",
    [],
    (cache, game, player) => defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], playable: true })
  ),
  new SituationExplanation(
    "money",
    "You gain $2 once each turn. You keep your money between turns.",
    [],
    (cache, game, player) =>
      game.history.find((x) => x.type == "game/addMoney" && x.payload.source == null)
        ? defaultUtil.filter(cache, game, {
            players: [player],
            zones: ["deck"],
            playable: true,
            minMoney: game.players[player].money - 2,
          })
        : []
  ),
  new SituationExplanation(
    "reveal",
    "Your opponent's cards begin the game hidden and must be revealed",
    [],
    (cache, game, player) =>
      defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], playable: true, text: "reveal" })
  ),
  new SituationExplanation(
    "agents",
    "Agents stay on board when played and can be exhausted once each turn",
    ["hand"],
    (cache, game, player) => defaultUtil.filter(cache, game, { players: [player], types: ["agent"], zones: ["board"] })
  ),
  new SituationExplanation(
    "operations",
    "Operations go to the grave immediately after being played",
    ["hand"],
    (cache, game, player) =>
      defaultUtil.filter(cache, game, { players: [player], types: ["operation"], zones: ["grave"] })
  ),
  new SituationExplanation(
    "cost",
    "Money is used to pay for money costs; Agents are exhausted to pay for agent costs",
    ["money", "agents"],
    (cache, game, player) =>
      defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], playable: true, minAgents: 1 })
  ),
  new SituationExplanation(
    "revealed",
    "Your can see which cards your opponent has revealed",
    ["reveal"],
    (cache, game, player) => defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], hidden: false })
  ),
  new SituationExplanation(
    "revealSelf",
    "Cards that affect your opponent reveal themselves",
    ["reveal"],
    (cache, game, player) =>
      game.history
        .filter((x) => x.type == "game/revealCard" && x.payload.source?.id == x.payload.target?.id)
        .map((x) => x.payload.target!)
  ),
  new SituationExplanation(
    "win",
    "You win the game when you remove all of your opponent's agents",
    ["agents", "reveal"],
    (cache, game, player) =>
      defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], playable: true, text: "remove" })
  ),
  new KeywordExplanation("protected", "Protected agents prevent the first time they would be removed", false, true),
  new KeywordExplanation("disloyal", "Disloyal agents don't prevent you from losing", true, false),
  new KeywordExplanation("vip", "VIP agents cannot be targeted as long as you have a loyal agent on board"),
  new KeywordExplanation("delay", "Delay agents are exhausted for X turns after being played"),
  new KeywordExplanation("debt", "Debt cards remove X money after two turns"),
  new KeywordExplanation("depart", "Depart agents are removed after they are exhausted X times"),
  new KeywordExplanation("tribute", "Tribute cards remove the lowest cost card in your deck when played"),
  new SituationExplanation(
    "revealPriority",
    "Reveal will prioritize your opponent's board, then deck, then grave",
    baseRequirements,
    (cache, game, player) => {
      const opponent = opponentOf(player);
      const actionIndex = game.history.findIndex((action) => isPlayerAction(action));
      const refs = game.history
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
        const vipBoard = defaultUtil.filter(cache, game, { players: [player], zones: ["board"], vip: true });
        const vipDeck = defaultUtil.filter(cache, game, { players: [player], zones: ["deck"], vip: true });
        const otherBoard = defaultUtil.filter(cache, game, {
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

export function explain(game: GameState, player: PlayerId): Explanation[] {
  const cache = new Map();
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
