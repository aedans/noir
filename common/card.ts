export type CardColor = "orange" | "blue" | "green" | "purple";
export type CardType = "guy" | "location" | "operation";
export type CardZone = "board" | "deck" | "hand";

export type Util = {
  getCardInfo: (card: CardState, player: PlayerState, opponent: PlayerState, base?: boolean) => CardInfo,
  defaultCardState: typeof defaultCardState,
  sample: <A> (as: A[]) => A,
  copy: <A> (a: A) => A,
}

export type CardData<A> = (util: Util, card: CardState, player: PlayerState, opponent: PlayerState) => A;

export type CardCost = {
  money?: number,
  guys?: { [K in CardColor]?: number },
}

export type CardEffect = (card: CardInfo) => CardInfo;
export type CardModifier = (card: CardInfo, modifier: ModifierState) => CardInfo;

export type CardInfo = {
  text: CardData<string>,
  type: CardData<CardType>,
  colors: CardData<CardColor[]>,
  cost: CardData<CardCost>,
  useCost?: CardData<CardCost>,
  play?: CardData<(() => void) | null>,
  use?: CardData<(() => void) | null>,
  update?: { [K in CardZone]?: CardData<void> },
  turn?: { [K in CardZone]?: CardData<void> },
  effects?: { [K in CardZone]?: CardEffect },
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
  modifiers: ModifierState[],
  numbers: { [name: string]: number },
  strings: { [name: string]: string }
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
    modifiers: [],
    numbers: {},
    strings: {},
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
      info = (util.getCardInfo(card, player, opponent, true).effects?.[zone] ?? (x => x))(info);
    }

    for (const card of opponent[zone]) {
      info = (util.getCardInfo(card, opponent, player, true).effects?.[zone] ?? (x => x))(info);
    }
  }

  return info;
}
