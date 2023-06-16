import { CardKeyword, Target } from "../common/card";
import { GameState, PlayerId, findCard, isPlayerAction, opponentOf } from "../common/gameSlice";
import util, { CardInfoCache } from "../common/util";
import { defaultUtil } from "./cards";

export interface Explanation {
  id: string;
  relevantCards(cache: CardInfoCache, game: GameState, player: PlayerId): Target[];
  text: string;
}

class KeywordExplanation implements Explanation {
  get id() {
    return this.keyword;
  }

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
  constructor(public id: string, public text: string, public relevantCards: Explanation["relevantCards"]) {}
}

export const explanations = [
  new KeywordExplanation("protected", "Protected agents prevent the first time they would be removed", false, true),
  new KeywordExplanation("disloyal", "Disloyal agents don't prevent you from losing", true, false),
  new KeywordExplanation("vip", "VIP agents cannot be targeted as long as you have a loyal agent on board"),
  new KeywordExplanation("delay", "Delay agents are exhausted for X turns after being played"),
  new KeywordExplanation("debt", "Debt cards remove X money after two turns"),
  new KeywordExplanation("depart", "Depart agents are removed after they are exhausted X times"),
  new KeywordExplanation("tribute", "Tribute cards remove the lowest cost card in your deck when played"),
  new SituationExplanation(
    "revealBoard",
    "Reveal will prioritize your opponent's board, then deck, then grave",
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
  new SituationExplanation("doubleVIP", "VIP agents will not protect other VIP agents", (cache, game, player) => {
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
  }),
];

export function explain(game: GameState, player: PlayerId): Explanation[] {
  const cache = new Map();
  return explanations.filter((e) => e.relevantCards(cache, game, player).length > 0);
}

export function setExplained(explanation: Explanation) {
  const explained = JSON.parse(localStorage.getItem("explained") ?? "{}");
  localStorage.setItem("explained", JSON.stringify({ ...explained, [explanation.id]: true }));
}

export function isExplained(explanation: Explanation) {
  return JSON.parse(localStorage.getItem("explained") ?? "{}")[explanation.id];
}
