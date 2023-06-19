import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { Goal, activateCard, afterTurn, afterWait, playCard, whenRevealLeft } from "../Goal";
import { Difficulty } from "../Mission";
import { MissionPlayer } from "../Player";

export default class RandomCitizens extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Random Citizens", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Value
      "Random Citizen": 4,
      "Local Socialite": 2,
      "Eager Employer": 2,
      // Interaction
      "Gang Up": 2,
      "Writ of Recall": 2,
      // Reveal
      "Brief Investigation": 2,
      "Snoop Around": 2,
      "Information Dealer": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      // Win
      "Arms Dealer": 2,
    }
  }

  goals: Goal[] = [
    // Win
    playCard("Arms Dealer"),
    activateCard("Arms Dealer", { zones: ["board"], protected: false }, true),
    activateCard("Arms Dealer", { zones: ["board"], vip: false }, true),
    activateCard("Arms Dealer", {}, true),
    // Value
    playCard("Local Socialite"),
    playCard("Random Citizen"),
    playCard("Eager Employer"),
    activateCard("Eager Employer"),
    // Interaction
    playCard("Writ of Recall", { zones: ["board"], minMoney: 5 }, true),
    playCard("Gang Up", { zones: ["board"], protected: false }, true),
    // Reveal
    whenRevealLeft(afterTurn(1, playCard("Brief Investigation"))),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
    whenRevealLeft(playCard("Information Dealer")),
    whenRevealLeft(activateCard("Information Dealer")),
  ];
}
