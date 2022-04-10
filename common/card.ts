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
  played?: { [K in CardZone]?: CardData<(played: CardState) => void> }, 
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

export function activate(id: string, player: PlayerState, opponent: PlayerState) {
  const state = getCardState(id, player, opponent);
  if (state) {
    state.revealed = true;
    state.used = true;  
  }
}

export function destroy(id: string, player: PlayerState, opponent: PlayerState) {
  removeCardState(id, player, opponent);
}

export function defaultUtil(getCardInfo: Util["getCardInfo"]): Util {
  return { getCardInfo, defaultCardState, chooseTargets, sample, isEqual, reveal, activate, destroy };
}
