import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { activateCard, afterLosing, afterPlaying, afterTurn, afterWait, playCard } from "../Goal";
import { Difficulty } from "../Mission";
import { ComputerPlayer } from "../Player";

export default class Daphril extends ComputerPlayer {
  constructor(player: PlayerId, name: string, public difficulty: Difficulty) {
    super(player, `${name} level ${difficulty}`);
  }

  cards() {
    const cards: Record<string, number> = {
      // Win
      "Daphril the Dauntless": 2,
      // Money Generation
      "Crispy Dollar": 4,
      "Local Merchant": 1,
      "Eager Employer": 1,
      Banker: 1,
      // Interaction
      "Strike Down": 1,
      "Writ of Recall": 3,
      "Debt Collection": 3,
      // Reveal
      "Brief Investigation": 2,
      "Snoop Around": 5,
      "Rogue Reporter": 1,
      // Protection
      Bodyguard: 1,
    };

    if (this.difficulty < 3) {
      cards["Daphril the Dauntless"] -= 1;
      cards["Crispy Dollar"] -= 2;
      cards["Writ of Recall"] -= 1;
      cards["Debt Collection"] -= 1;
    }

    if (this.difficulty < 2) {
      delete cards["Bodyguard"];
      delete cards["Crispy Dollar"];
      delete cards["Banker"];
      cards["Debt Collection"] -= 1;
    }

    return cards;
  }

  deck: Deck = {
    cards: this.cards(),
  };

  goals = [
    // Win
    playCard("Daphril the Dauntless"),
    activateCard("Daphril the Dauntless"),
    // Money Generation
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
    afterPlaying("Daphril the Dauntless", playCard("Rogue Reporter")),
    afterTurn(1, playCard("Brief Investigation")),
    afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around"))),
    // Protection
    afterLosing("Eager Employer", playCard("Bodyguard")),
  ];
}
