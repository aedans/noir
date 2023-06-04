import { Deck } from "../../common/decksSlice";
import { activateCard, afterLosing, afterPlaying, afterTurn, afterWait, playCard } from "../Goal";
import { ComputerPlayer } from "../Player";

export default class Daphril extends ComputerPlayer {
  deck: Deck = {
    cards: {
      // Win
      "Daphril the Dauntless": 1,
      // Money Generation
      "Crispy Dollar": 2,
      "Local Merchant": 1,
      "Eager Employer": 1,
      Banker: 1,
      // Interaction
      "Moment of Opportunity": 1,
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
    playCard("Moment of Opportunity", { zones: ["board"], protected: false, minMoney: 5 }, true),
    playCard("Debt Collection", { zones: ["board"], colors: ["blue", "green", "orange", "purple"] }, true),
    // Reveal
    afterPlaying("Daphril the Dauntless", playCard("Rogue Reporter")),
    afterTurn(1, playCard("Brief Investigation")),
    afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around"))),
    // Protection
    afterLosing("Eager Employer", playCard("Bodyguard")),
  ];
}
