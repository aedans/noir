import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class IndustrialDesign extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Industrial Design", difficulty, {});
  }

  deck1: Deck = {
    cards: {
      // Win
      "Charismatic Industrialist": 2,
      // Value
      "Stake Capital": 2,
      "Bold Investor": 2,
      "Careful Speculation": 2,
      "Eager Salesman": 2,
      "Company Salesman": 1,
      Bodyguard: 1,
      // Interaction
      "Harassment Campaign": 2,
      "Writ of Recall": 2,
      // Reveal
      "Trade Secrets": 2,
      "Rogue Reporter": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "Careful Speculation": 3,
      "Trade Secrets": 4,
      "Writ of Recall": 3,
      "Harassment Campaign": 3,
    },
  };
}
