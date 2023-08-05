import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import {
  Goal,
  activateCard,
  agents,
  eq,
  gt,
  lt,
  whenActionTurn,
  playCard,
  seq,
  when,
  whenNotInPlay,
  whenRevealLeft,
  afterWait,
} from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class UnderhandedDealings extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Underhanded Dealings", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Win
      "Ruthless Cutthroat": 2,
      // Value
      "Crispy Dollar": 2,
      "Sinister Deal": 2,
      "Shifty Operative": 2,
      "New Hire": 4,
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

  goals: Goal[] = [
    // Early Game
    when(lt(2), "self", agents(["purple"]))(playCard(["Random Citizen", "Shifty Operative", "New Hire"])),
    // Win
    playCard("Ruthless Cutthroat"),
    activateCard("Ruthless Cutthroat", { zones: ["board"], protected: false }, true),
    activateCard("Ruthless Cutthroat", { zones: ["board"], vip: false }, true),
    activateCard("Ruthless Cutthroat", {}, true),
    // Value
    playCard("Crispy Dollar"),
    when(lt(1), "self", agents(["purple"]))(playCard(["Shifty Operative", "New Hire"])),
    whenActionTurn(["game/removeCard", "game/stealCard"], playCard("Sinister Deal")),
    // Interaction
    playCard("Bad Deal", { zones: ["board"] }, true),
    playCard("Entice", { zones: ["board"], minMoney: 6 }, true),
    // Reveal
    whenRevealLeft(afterWait("Examine the Bodies", 1, playCard("Examine the Bodies"))),
    whenRevealLeft(whenNotInPlay("Gutterside Informer", playCard("Gutterside Informer"))),
    whenRevealLeft(activateCard("Gutterside Informer")),
  ];
}
