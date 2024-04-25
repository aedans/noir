import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { SoloPlayer } from "../Player.js";

export default class Daphril extends SoloPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Daphril the Dauntless", difficulty, {});
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
}
