import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import { SoloPlayer } from "../Player.js";

export default class Tutorial1 extends SoloPlayer {
  constructor(player: PlayerId) {
    super(player, "Tutorial");
  }

  deck1: Deck = {
    cards: {
      "Double Agent": 2,
    }
  };

  playerDeck: Deck = {
    cards: {
      "Random Citizen": 1,
      "Eager Employer": 1,
      "Strike Down": 2,
      "Snoop Around": 1,
    }
  }
}