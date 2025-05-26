import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { SoloPlayer } from "../Player.js";

export default class CivicProceedings extends SoloPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Civic Proceedings", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Win
      "Prolific Jailer": 2,
      // Value
      "Aspiring Lawman": 2,
      "Expedited Training": 2,
      "Frazzled Secretary": 2,
      "Bearer of Lanterns": 2,
      // Interaction
      "Stern Peacekeeper": 2,
      Detain: 2,
      "Writ of Recall": 2,
      // Reveal
      "Information Dealer": 2,
      "Snoop Around": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "Expedited Training": 4,
      "Snoop Around": 4,
      Detain: 3,
    },
  };
}
