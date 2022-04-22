import { v4 as uuidv4 } from 'uuid';
import { sample } from './utils';

export type CardColor = "orange" | "blue" | "green" | "purple";
export type CardColors = CardColor | "any";
export type CardType = "agent" | "location" | "operation";
export type CardRank = 1 | 2 | 3;
export type CardZone = "board" | "deck" | "hand" | "graveyard";

export type Util = {
  getCardInfo: (card: CardState, player: PlayerState, opponent: PlayerState, base?: boolean) => CardInfo,
  defaultCardState: typeof defaultCardState,
  chooseTargets: typeof chooseTargets,
  sample: typeof sample,
  getCardState: typeof getCardState,
  reveal: typeof reveal,
  revealRandom: typeof revealRandom,
  activate: typeof activate,
  destroy: typeof destroy,
  destroyRandom: typeof destroyRandom
}

export type CardData<A> = (util: Util, card: CardState, player: PlayerState, opponent: PlayerState) => A;

export type CardCost = {
  money: number,
  agents?: { [K in CardColors]?: number },
}

export type CardEffect = (card: CardInfo) => CardInfo;
export type CardModifier = (card: CardInfo, modifier: ModifierState) => CardInfo;

export type CardChoice = {
  targets?: { [name: string]: string[] }
}

export type CardAction = (choice: CardChoice) => void;
export type CardChoiceAction = (cc: (choice: CardChoice) => void) => void

export type CardInfo = {
  text: CardData<string>,
  type: CardData<CardType>,
  colors: CardData<CardColor[]>,
  cost: CardData<CardCost>,
  useCost?: CardData<CardCost>,
  rank: CardData<CardRank>,
  playChoice?: CardData<CardChoiceAction | null>,
  useChoice?: CardData<CardChoiceAction | null>,
  play?: CardData<CardAction | null>,
  use?: CardData<CardAction | null>,
  activate?: CardData<void>,
  reveal?: CardData<void>,
  destroy?: CardData<void>,
  update?: CardData<void>,
  turn?: CardData<void>,
  effects?: { [K in CardZone]?: CardData<CardEffect> },
  modifiers?: { [name: string]: CardModifier },
}

export type PlayerState = {
  id: string,
  board: CardState[],
  deck: CardState[],
  hand: CardState[],
  graveyard: CardState[],
  money: number,
  turn: boolean,
}

export type ModifierState = {
  card: string,
  name: string,
}

export type CardState = {
  name: string,
  id: string,
  revealed: boolean,
  activated: boolean,
  modifiers: ModifierState[],
  number: { [name: string]: number },
  numbers: { [name: string]: number[] },
  string: { [name: string]: string },
  strings: { [name: string]: string[] }
}

export type StartMessage = {
  name: string,
  deck: string[],
}

export type StopMessage = {
  winner: string,
}

export type PlayerAction 
  = { type: "end" }
  | { type: "play", card: string, choice: CardChoice }
  | { type: "use", card: string, choice: CardChoice }

export const cardZones: CardZone[] = ["board", "deck", "hand", "graveyard"];

export function defaultCardState(name: string): CardState {
  return {
    name,
    id: uuidv4(),
    revealed: false,
    activated: true,
    modifiers: [],
    number: {},
    numbers: {},
    string: {},
    strings: {},
  };
}

export function defaultPlayerState(): PlayerState {
  return {
    id: uuidv4(),
    money: 100,
    hand: [],
    board: [],
    deck: [],
    graveyard: [],
    turn: false,
  };
}

export function sort(util: Util, cards: CardState[], player: PlayerState, opponent: PlayerState) {
  cards.sort((a, b) => {
    const aColors = util.getCardInfo(a, player, opponent).colors(util, a, player, opponent).reduce((a, b) => a + " " + b, "");
    const bColors = util.getCardInfo(b, player, opponent).colors(util, b, player, opponent).reduce((a, b) => a + " " + b, "");
    if (aColors != bColors) return aColors < bColors ? -1 : 1;
    const aCost = util.getCardInfo(a, player, opponent).cost(util, a, player, opponent).money;
    const bCost = util.getCardInfo(b, player, opponent).cost(util, a, player, opponent).money;
    if (aCost != bCost) return aCost < bCost ? -1 : 1;
    const aType = util.getCardInfo(a, player, opponent).type(util, a, player, opponent);
    const bType = util.getCardInfo(b, player, opponent).type(util, b, player, opponent);
    if (aType != bType) return aType < bType ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });
}

export function getCardState(id: string, p1: PlayerState, p2: PlayerState) {
  for (const player of [p1, p2]) {
    for (const zone of cardZones) {
      const result = player[zone].find(c => c.id == id);
      if (result) return result;
    }
  }
  return null;
}

export function chooseTargets<A>(targets: string[], number: number, upto: boolean, cc: (targets: string[] | null) => A): A | void {
  if (!upto && number > targets.length) {
    return cc(null);
  } else {
    return cc(targets.slice(0, number));
  }
}

export function updateCardInfo(util: Util, info: CardInfo, state: CardState, player: PlayerState, opponent: PlayerState) {
  for (const modifier of state.modifiers) {
    const card = getCardState(modifier.card, player, opponent);
    if (card) {
      const modifiers = util.getCardInfo(card, player, opponent, true).modifiers ?? {};
      info = modifiers[modifier.name](info, modifier);  
    }
  }

  for (const zone of cardZones) {
    for (const card of player[zone]) {
      info = (util.getCardInfo(card, player, opponent, true).effects?.[zone]?.(util, card, player, opponent) ?? (x => x))(info);
    }

    for (const card of opponent[zone]) {
      info = (util.getCardInfo(card, opponent, player, true).effects?.[zone]?.(util, card, opponent, player) ?? (x => x))(info);
    }
  }

  return info;
}

export function choice(util: Util, choose: CardData<CardChoiceAction | null> | undefined, cost: CardCost | undefined, card: CardState, player: PlayerState, opponent: PlayerState, cc: (choice: CardChoice | null) => void) {
  return (choose ?? (() => (cc) => cc({})))(util, card, player, opponent)?.((choice) => {
    if (choice == null) return cc(null);
    if (!choice.targets) choice.targets = {};

    const agents = cost?.agents ?? {};
    return activate(Object.keys(agents) as CardColors[]);

    function activate(colors: CardColors[]): void {
      if (colors.length == 0) return cc(choice);
      let activateTargets = player.board
        .filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
        .filter(c => c.activated == false);
      if (colors[0] != "any")
        activateTargets = activateTargets.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes(colors[0] as CardColor))
      return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (targets) => {
        if (targets == null) return cc(null);
        choice.targets![colors[0]] = targets;
        return activate(colors.slice(1));
      });
    }
  });
}

export function reveal(this: Util, id: string, p1: PlayerState, p2: PlayerState) {
  for (const [player, opponent] of [[p1, p2], [p2, p1]]) {
    for (const zone of cardZones) {
      const card = player[zone].find(c => c.id == id);
      if (card && !card.revealed) {
        card.revealed = true;
    
        const reveal = this.getCardInfo(card, player, opponent).reveal;
        if (reveal != null) {
          reveal(this, card, player, opponent);
        }
      }
    }
  }
}

export function revealRandom(this: Util, cards: CardState[], p1: PlayerState, p2: PlayerState) {
  const card = sample(cards.filter(c => !c.revealed));
  if (card) this.reveal(card.id, p1, p2);
}

export function activate(this: Util, id: string, p1: PlayerState, p2: PlayerState) {
  for (const [player, opponent] of [[p1, p2], [p2, p1]]) {
    for (const zone of cardZones) {
      const card = player[zone].find(c => c.id == id);
      if (card) {
        card.activated = true;
        this.reveal(id, player, opponent);
        
        const activate = this.getCardInfo(card, player, opponent).activate;
        if (activate != null) {
          activate(this, card, player, opponent);
        }
      }
    }
  }
}

export function destroy(this: Util, id: string, p1: PlayerState, p2: PlayerState) {
  for (const [player, opponent] of [[p1, p2], [p2, p1]]) {
    for (const zone of cardZones) {
      const index = player[zone].findIndex(c => c.id == id);
      if (index >= 0) {
        const state = player[zone][index];
        player[zone].splice(index, 1);
        player.graveyard.push(state);

        const destroy = this.getCardInfo(state, player, opponent).destroy;
        if (destroy != null) {
          destroy(this, state, player, opponent);
        }
      }
    }
  }
}

export function destroyRandom(this: Util, cards: CardState[], p1: PlayerState, p2: PlayerState) {
  const card = sample(cards);
  if (card) this.destroy(card.id, p1, p2);
}

export function defaultUtil(getCardInfo: Util["getCardInfo"]): Util {
  return { getCardInfo, defaultCardState, chooseTargets, sample, getCardState, reveal, revealRandom, activate, destroy, destroyRandom };
}
