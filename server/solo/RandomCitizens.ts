import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { Difficulty } from "../Mission.js";
import { SoloPlayer } from "../Player.js";

export default class RandomCitizens extends SoloPlayer {
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
}
