import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import util from "../../common/util.js";
import { random } from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";
import { cards } from "../db.js";

function randomDeck() {
  const deck: Deck = { cards: {} };
  for (let i = 0; i < 20; i++) {
    const card = util.random(cards());

    if (!deck.cards[card]) {
      deck.cards[card] = 0;
    }

    if (deck.cards[card] >= 2) {
      i--;
      continue;
    }

    deck.cards[card]++;
  }
  return deck;
}

export default class Random extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Random", difficulty);
  }

  deck1: Deck = randomDeck();
  deck2: Deck = this.deck1;
  goals = [random];
}
