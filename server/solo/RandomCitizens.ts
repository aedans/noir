import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { Goal, activateCard, afterTurn, afterWait, ifRevealLeft, playCard } from "../Goal";
import { Difficulty } from "../Mission";
import { MissionPlayer } from "../Player";

export default class RandomCitizens extends MissionPlayer {
  constructor(player: PlayerId, public difficulty: Difficulty) {
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
    activateCard("Arms Dealer", { ordering: ["money"] }, true),
    // Value
    playCard("Local Socialite"),
    playCard("Random Citizen"),
    playCard("Eager Employer"),
    activateCard("Eager Employer"),
    // Interaction
    playCard("Writ of Recall", { zones: ["board"], minMoney: 5 }, true),
    playCard("Gang Up", { zones: ["board"], protected: false }, true),
    // Reveal
    ifRevealLeft(afterTurn(1, playCard("Brief Investigation"))),
    ifRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
    ifRevealLeft(playCard("Information Dealer")),
    ifRevealLeft(activateCard("Information Dealer")),
  ];
}
