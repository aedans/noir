import { Deck } from "../../common/decksSlice.js";
import { PlayerId } from "../../common/gameSlice.js";
import {
  Goal,
  activateCard,
  afterTurn,
  afterWait,
  basicAgents,
  eq,
  lt,
  playCard,
  when,
  whenRevealLeft,
} from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class CivicProceedings extends MissionPlayer {
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

  goals: Goal[] = [
    // Early Game
    when(lt(1), "self", basicAgents(["blue"]))(playCard(["Aspiring Lawman", "Bearer of Lanterns"])),
    // Win
    playCard("Prolific Jailer"),
    activateCard("Prolific Jailer", { zones: ["board"], protected: false }, true),
    activateCard("Prolific Jailer", { zones: ["board"], vip: false }, true),
    activateCard("Prolific Jailer", {}, true),
    // Value
    playCard("Expedited Training"),
    playCard("Frazzled Secretary"),
    activateCard("Frazzled Secretary"),
    playCard("Bearer of Lanterns"),
    // Interaction
    playCard("Stern Peacekeeper"),
    playCard("Writ of Recall", { zones: ["board"] }, true),
    playCard("Detain", { zones: ["board"] }, true),
    // Reveal
    whenRevealLeft(playCard("Information Dealer")),
    whenRevealLeft(activateCard("Information Dealer")),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
  ];
}
