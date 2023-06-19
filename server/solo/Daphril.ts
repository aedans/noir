import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { activateCard, afterLosing, afterPlaying, afterTurn, afterWait, playCard, whenRevealLeft } from "../Goal";
import { Difficulty } from "../Mission";
import { MissionPlayer } from "../Player";

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
      // Interaction
      "Strike Down": 1,
      "Writ of Recall": 2,
      "Debt Collection": 2,
      // Reveal
      "Brief Investigation": 2,
      "Snoop Around": 5,
      "Rogue Reporter": 1,
      // Protection
      Bodyguard: 1,
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
    playCard("Eager Employer"),
    activateCard("Eager Employer"),
    playCard("Banker"),
    // Interaction
    playCard("Writ of Recall", { zones: ["board"], minMoney: 5 }, true),
    playCard("Strike Down", { zones: ["board"], protected: false, minMoney: 5 }, true),
    playCard("Debt Collection", { zones: ["board"], colors: ["blue", "green", "orange", "purple"] }, true),
    // Reveal
    whenRevealLeft(afterPlaying("Daphril the Dauntless", playCard("Rogue Reporter"))),
    whenRevealLeft(afterTurn(1, playCard("Brief Investigation"))),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
    // Protection
    afterLosing("Eager Employer", playCard("Bodyguard")),
  ];
}
