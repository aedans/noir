import { Deck } from "../../common/decks.js";
import { PlayerId } from "../../common/gameSlice.js";
import {
  Goal,
  activateCard,
  afterTurn,
  afterWait,
  eq,
  gt,
  playCard,
  seq,
  when,
  whenMoney,
  whenRevealLeft,
} from "../Goal.js";
import { Difficulty } from "../Mission.js";
import { MissionPlayer } from "../Player.js";

export default class IndustrialDesign extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Industrial Design", difficulty);
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

  goals: Goal[] = [
    // Win
    playCard("Charismatic Industrialist"),
    activateCard("Charismatic Industrialist", { zones: ["board"] }, true),
    activateCard("Charismatic Industrialist", { zones: ["board"], vip: false }, true),
    activateCard("Charismatic Industrialist", {}, true),
    // Value
    playCard("Stake Capital"),
    playCard("Bold Investor"),
    activateCard("Bold Investor"),
    afterTurn(5, playCard("Careful Speculation")),
    playCard("Eager Salesman"),
    seq(playCard("Company Salesman"), when(eq(0), "self", { names: ["Eager Salesman"] })),
    seq(
      playCard("Bodyguard"),
      when(eq(0), "self", { zones: ["board"], types: ["agent"], disloyal: false }),
      when(gt(0), "self", { vip: true, hidden: false })
    ),
    // Interaction
    whenMoney("lt", 5, playCard("Harrassment Campaign", {}, true)),
    playCard("Writ of Recall", { zones: ["board"], minMoney: 5 }, true),
    // Reveal
    whenRevealLeft(afterWait("Trade Secrets", 2, playCard("Trade Secrets"))),
    whenRevealLeft(playCard("Rogue Reporter")),
  ];
}
