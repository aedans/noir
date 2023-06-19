import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { Goal, activateCard, afterTurn, afterWait, playCard, whenRevealLeft } from "../Goal";
import { Difficulty } from "../Mission";
import { MissionPlayer } from "../Player";

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
      "Unyielding Investigator": 2,
      // Interaction
      "Stern Peacekeeper": 2,
      Detain: 2,
      "Debt Collection": 2,
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
    // Win
    playCard("Prolific Jailer"),
    activateCard("Prolific Jailer", {}, true),
    // Value
    playCard("Aspiring Lawman"),
    playCard("Expedited Training"),
    playCard("Frazzled Secretary"),
    activateCard("Frazzled Secretary"),
    playCard("Unyielding Investigator"),
    // Interaction
    playCard("Stern Peacekeeper"),
    playCard("Detain", {}, true),
    playCard("Debt Collection", { zones: ["board"], colors: ["blue", "green", "orange", "purple"] }, true),
    // Reveal
    whenRevealLeft(playCard("Information Dealer")),
    whenRevealLeft(activateCard("Information Dealer")),
    whenRevealLeft(afterTurn(1, afterWait("Snoop Around", 1, playCard("Snoop Around")))),
  ];
}
