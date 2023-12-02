import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class StrengthInNumbers extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Strength in Numbers", difficulty, {});
  }

  deck1: Deck = {
    cards: {
      // Win
      "Raving Pugilist": 1,
      "Arms Dealer": 1,
      "Take Arms": 2,
      // Value
      "Dues Collector": 1,
      "Local Socialite": 1,
      "Cut-rate Contractor": 2,
      "Ill-fated Operative": 2,
      "Gismo Inspector": 2,
      // Interaction
      "Gang Up": 2,
      "Compelled Resignation": 2,
      // Reveal
      Coerce: 2,
      "Information Dealer": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "Gang Up": 4,
      Coerce: 4,
      "Ill-fated Operative": 3,
    },
  };
}
