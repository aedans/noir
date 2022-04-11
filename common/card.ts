import { isEqual, sample } from "lodash";
import { v4 as uuidv4 } from 'uuid';

export type CardColor = "orange" | "blue" | "green" | "purple";
export type CardType = "agent" | "location" | "operation";
export type CardRank = 1 | 2 | 3;
export type CardZone = "board" | "deck" | "hand";

export type Util = {
  getCardInfo: (card: CardState, player: PlayerState, opponent: PlayerState, base?: boolean) => CardInfo,
  defaultCardState: typeof defaultCardState,
  chooseTargets: typeof chooseTargets,
  sample: typeof sample,
  isEqual: typeof isEqual,
  reveal: typeof reveal,
  activate: typeof activate,
  destroy: typeof destroy,
}

export type CardData<A> = (util: Util, card: CardState, player: PlayerState, opponent: PlayerState) => A;

export type CardCost = {
  money: number,
  guys?: { [K in CardColor]?: number },
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
  update?: { [K in CardZone]?: CardData<void> },
  turn?: { [K in CardZone]?: CardData<void> },
  effects?: { [K in CardZone]?: CardData<CardEffect> },
  modifiers?: { [name: string]: CardModifier },
}

export type PlayerState = {
  board: CardState[],
  deck: CardState[],
  hand: CardState[],
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
  used: boolean,
  modifiers: ModifierState[],
  number: { [name: string]: number },
  string: { [name: string]: string }
}

export type Init = {
  deck: string[],
}

export type PlayerAction 
  = { type: "end" }
  | { type: "play", card: string, choice: CardChoice }
  | { type: "use", card: string, choice: CardChoice }

export function defaultCardState(name: string): CardState {
  return {
    name,
    id: uuidv4(),
    revealed: false,
    used: true,
    modifiers: [],
    number: {},
    string: {},
  };
}

export function defaultPlayerState(): PlayerState {
  return {
    money: 100,
    hand: [],
    board: [],
    deck: [],
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

export function getCardState(id: string, player: PlayerState, opponent: PlayerState) {
  for (const place of [player.deck, player.board, opponent.deck, opponent.board]) {
    const result = place.find(c => c.id == id);
    if (result) return result;
  }
  return null;
}

export function removeCardState(id: string, player: PlayerState, opponent: PlayerState) {
  for (const place of [player.deck, player.board, opponent.deck, opponent.board]) {
    const index = place.findIndex(c => c.id == id);
    if (index >= 0) place.splice(index, 1);
  }
}

export function chooseTargets<A>(targets: string[], number: number, upto: boolean, cc: (targets: string[] | null) => A): A | void {
  if (!upto && number > targets.length) {
    return cc(null);
  } else {
    return cc([]);
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

  for (const zone of ["board", "deck", "hand"] as CardZone[]) {
    for (const card of player[zone]) {
      info = (util.getCardInfo(card, player, opponent, true).effects?.[zone]?.(util, card, player, opponent) ?? (x => x))(info);
    }

    for (const card of opponent[zone]) {
      info = (util.getCardInfo(card, opponent, player, true).effects?.[zone]?.(util, card, player, opponent) ?? (x => x))(info);
    }
  }

  return info;
}

export function reveal(cards: CardState[]) {
  const card = sample(cards.filter(c => !c.revealed));
  if (card) card.revealed = true;
}

export function activate(this: Util, id: string, player: PlayerState, opponent: PlayerState) {
  const card = getCardState(id, player, opponent);
  if (card) {
    card.revealed = true;
    card.used = true;  
    
    const activate = this.getCardInfo(card, player, opponent).activate;
    if (activate != null) {
      activate(this, card, player, opponent);
    }
  }
}

export function destroy(id: string, player: PlayerState, opponent: PlayerState) {
  removeCardState(id, player, opponent);
}

export function defaultUtil(getCardInfo: Util["getCardInfo"]): Util {
  return { getCardInfo, defaultCardState, chooseTargets, sample, isEqual, reveal, activate, destroy };
}
