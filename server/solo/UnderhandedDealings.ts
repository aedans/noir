import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class UnderhandedDealings extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Underhanded Dealings", difficulty, {});
  }

  deck1: Deck = {
    cards: {
      // Win
      "Problem Solver": 2,
      // Value
      "Crispy Dollar": 2,
      "Sinister Deal": 2,
      "Shifty Operative": 3,
      "New Hire": 3,
      // Interaction
      "Bad Deal": 2,
      Entice: 2,
      // Reveal
      "Gutterside Informer": 2,
      "Examine the Bodies": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "New Hire": 5,
      "Sinister Deal": 2,
      Entice: 3,
      "Bad Deal": 3,
    },
  };
}
