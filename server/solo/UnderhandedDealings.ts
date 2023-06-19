import { Deck } from "../../common/decksSlice";
import { PlayerId } from "../../common/gameSlice";
import { Goal, activateCard, coloredAgents, eq, gt, lt, playCard, seq, when, whenNotInPlay, whenRevealLeft } from "../Goal";
import { Difficulty } from "../Mission";
import { MissionPlayer } from "../Player";

export default class UnderhandedDealings extends MissionPlayer {
  constructor(player: PlayerId, difficulty: Difficulty) {
    super(player, "Underhanded Dealings", difficulty);
  }

  deck1: Deck = {
    cards: {
      // Win
      "Ruthless Cutthroat": 2,
      // Value
      "Crispy Dollar": 1,
      "Sinister Deal": 2,
      "Undercity Tavernkeep": 2,
      "Shifty Operative": 2,
      Bodyguard: 2,
      "New Hire": 2,
      // Interaction
      "Smoking Gun's Curse": 1,
      "Eliminate Opposition": 2,
      // Reveal
      "Rogue Reporter": 2,
      "Examine the Bodies": 2,
    },
  };

  deck2: Deck = {
    cards: {
      ...this.deck1.cards,
      "New Hire": 4,
      "Crispy Dollar": 2,
      "Eliminate Opposition": 3,
      "Smoking Gun's Curse": 2,
    },
  };

  goals: Goal[] = [
    // Win
    playCard("Ruthless Cutthroat"),
    activateCard("Ruthless Cutthroat", { zones: ["board"], protected: false }, true),
    activateCard("Ruthless Cutthroat", { zones: ["board"], vip: false }, true),
    activateCard("Ruthless Cutthroat", {}, true),
    // Value
    playCard("Crispy Dollar"),
    playCard("Undercity Tavernkeep"),
    playCard("Shifty Operative"),
    seq(
      playCard("Bodyguard"),
      when(eq(0), "self", { zones: ["board"], types: ["agent"], disloyal: false }),
      when(gt(0), "self", { vip: true, hidden: false })
    ),
    seq(playCard("New Hire"), when(eq(0), "self", coloredAgents)),
    // Interaction
    playCard("Smoking Gun's Curse", { zones: ["board"], exhausted: true }, true),
    playCard("Eliminate Opposition"),
    // Reveal
    whenRevealLeft(playCard("Examine the Bodies")),
    whenRevealLeft(seq(playCard("Rogue Reporter"), when(eq(0), "self", { names: ["Examine the Bodies"] }))),
  ];
}
