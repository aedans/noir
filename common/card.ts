import _ from "lodash";

export type CardColor = "orange" | "blue" | "green" | "purple";
export type CardType = "agent" | "location" | "operation";
export type CardRank = 1 | 2 | 3;
export type CardZone = "board" | "deck" | "hand";

export type Util = {
  getCardInfo: (card: CardState, player: PlayerState, opponent: PlayerState, base?: boolean) => CardInfo,
  defaultCardState: typeof defaultCardState,
  sample: typeof _.sample,
  cloneDeep: typeof _.cloneDeep,
  isEqual: typeof _.isEqual,
}

export type CardData<A> = (util: Util, card: CardState, player: PlayerState, opponent: PlayerState) => A;

export type CardCost = {
  money: number,
  guys?: { [K in CardColor]?: number },
}

export type CardEffect = (card: CardInfo) => CardInfo;
export type CardModifier = (card: CardInfo, modifier: ModifierState) => CardInfo;

export type CardInfo = {
  text: CardData<string>,
  type: CardData<CardType>,
  colors: CardData<CardColor[]>,
  cost: CardData<CardCost>,
  rank: CardData<CardRank>,
  useCost?: CardData<CardCost>,
  play?: CardData<(() => void) | null>,
  use?: CardData<(() => void) | null>,
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
  card: CardState,
  name: string,
}

export type CardState = {
  name: string,
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
  | { type: "play", card: CardState }
  | { type: "use", card: CardState }

export function defaultCardState(name: string): CardState {
  return {
    name,
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

export function updateCardInfo(util: Util, info: CardInfo, state: CardState, player: PlayerState, opponent: PlayerState) {
  for (const modifier of state.modifiers) {
    const modifiers = util.getCardInfo(modifier.card, player, opponent, true).modifiers ?? {};
    info = modifiers[modifier.name](info, modifier);
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
