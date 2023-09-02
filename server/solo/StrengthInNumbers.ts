import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Goal, activateCard, gt, playCard, seq, when, whenRevealLeft } from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class StrengthInNumbers extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Strength in Numbers", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Win
      "Raving Pugilist": 1,
      "Arms Dealer": 1,
      "Take Arms": 2,
      // Value
      "Dues Collector": 1,
      "Local Socialite": 1,
      "Cut-rate Contractor": 2,
      "Ill-fated Operative": 2,
      "Gismo Inspector": 2,
      // Interaction
      "Gang Up": 2,
      "Compelled Resignation": 2,
      // Reveal
      Coerce: 2,
      "Information Dealer": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "Gang Up": 4,
      Coerce: 4,
      "Ill-fated Operative": 3,
    },
  };

  goals: Goal[] = [
    // Win
    seq(playCard("Raving Pugilist"), when(gt(5), "opponent", { hidden: false, types: ["agent"] })),
    playCard("Arms Dealer"),
    activateCard("Arms Dealer", { zones: ["board"], protected: false }, true),
    activateCard("Arms Dealer", { zones: ["board"], vip: false }, true),
    activateCard("Arms Dealer", {}, true),
    seq(
      playCard("Take Arms"),
      when(gt(1), "self", { zones: ["board"], types: ["agent"], colors: ["orange"], exhausted: false }),
      when(gt(1), "opponent", { types: ["agent"], zones: ["board"], protected: false })
    ),
    // Value
    playCard("Dues Collector"),
    activateCard("Dues Collector"),
    playCard("Local Socialite"),
    playCard("Cut-rate Contractor"),
    playCard("Ill-fated Operative"),
    playCard("Gismo Inspector"),
    // Interaction
    playCard("Compelled Resignation", { zones: ["board"], maxMoney: 4 }, true),
    playCard("Gang Up", { zones: ["board"], protected: false, minMoney: 5 }, true),
    // Reveal
    whenRevealLeft(playCard("Coerce")),
    whenRevealLeft(playCard("Information Dealer")),
    whenRevealLeft(activateCard("Information Dealer")),
  ];
}
