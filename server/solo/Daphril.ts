import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import {
  activateCard,
  afterPlaying,
  afterTurn,
  afterWait,
  eq,
  gt,
  playCard,
  seq,
  when,
  whenRevealLeft,
} from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class Daphril extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Daphril the Dauntless", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Win
      "Daphril the Dauntless": 1,
      // Value
      "Crispy Dollar": 2,
      "Local Merchant": 1,
      "Eager Employer": 1,
      Banker: 1,
      Bodyguard: 1,
      // Interaction
      "Strike Down": 1,
      "Writ of Recall": 2,
      "Debt Collection": 2,
      // Reveal
      "Brief Investigation": 2,
      "Snoop Around": 5,
      "Rogue Reporter": 1,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "Daphril the Dauntless": 2,
      "Crispy Dollar": 4,
      "Writ of Recall": 3,
      "Debt Collection": 3,
    },
  };

  goals = [
    // Win
    playCard("Daphril the Dauntless"),
    activateCard("Daphril the Dauntless"),
    // Value
    playCard("Crispy Dollar"),
    playCard("Local Merchant"),
    activateCard("Local Merchant"),
    playCard("Eager Employer"),
    activateCard("Eager Employer"),
    playCard("Banker"),
    activateCard("Banker"),
    seq(
      playCard("Bodyguard"),
      when(eq(0), "self", { zones: ["board"], types: ["agent"], disloyal: false }),
      when(gt(0), "self", { vip: true, hidden: false })
    ),
    // Interaction
    playCard("Writ of Recall", { zones: ["board"], minMoney: 5 }, true),
    playCard("Strike Down", { zones: ["board"], protected: false, minMoney: 5 }, true),
    playCard("Debt Collection", { zones: ["board"], colors: ["blue", "green", "orange", "purple"] }, true),
    // Reveal
    whenRevealLeft(afterPlaying("Daphril the Dauntless", playCard("Rogue Reporter"))),
    whenRevealLeft(afterTurn(1, playCard("Brief Investigation"))),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
  ];
}
