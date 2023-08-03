import { Deck } from "../../common/decksSlice.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Goal, activateCard, afterTurn, afterWait, playCard, whenRevealLeft } from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class RandomCitizens extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Random Citizens", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Value
      "Random Citizen": 2,
      "Local Socialite": 1,
      "Eager Employer": 2,
      // Interaction
      "Gang Up": 2,
      "Strike Down": 2,
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
      "Random Citizen": 4,
      "Arms Dealer": 2,
      "Gang Up": 3,
    },
  };

  goals: Goal[] = [
    // Win
    playCard("Arms Dealer"),
    activateCard("Arms Dealer", { zones: ["board"], protected: false }, true),
    activateCard("Arms Dealer", { zones: ["board"], vip: false }, true),
    activateCard("Arms Dealer", {}, true),
    // Value
    playCard("Local Socialite"),
    activateCard("Local Socialite"),
    playCard("Random Citizen"),
    playCard("Eager Employer"),
    // Interaction
    playCard("Gang Up", { zones: ["board"], protected: false }, true),
    playCard("Strike Down", { zones: ["board"], protected: false }, true),
    activateCard("Eager Employer"),
    // Reveal
    whenRevealLeft(afterTurn(1, playCard("Brief Investigation"))),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
    whenRevealLeft(playCard("Information Dealer")),
    whenRevealLeft(activateCard("Information Dealer")),
  ];
}
