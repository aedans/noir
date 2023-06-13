import Player from "./Player";
import {
  currentPlayer,
  findCard,
  GameAction,
  GameState,
  getCard,
  opponentOf,
  PlayerId,
  revealCard,
} from "../common/gameSlice";
import { defaultUtil } from "./card";
import { CardColor, CardCost, CardGenerator, CardState, Target } from "../common/card";
import {
  HistoryAction,
  historySlice,
  HistoryState,
  initialHistoryState,
  setAction,
  setHidden,
  liftAction,
  cleanAction,
} from "../common/historySlice";
import { CardInfoCache, Filter } from "../common/util";
import { PlayerAction, PlayerInit } from "../common/network";

export type OnGameEnd = (
  winner: PlayerId,
  players: [Player, Player],
  inits: [PlayerInit, PlayerInit],
  state: HistoryState
) => void;

function* doEndTurn(cache: CardInfoCache, game: GameState): CardGenerator {
  const player = currentPlayer(game);
  yield* defaultUtil.addMoney(cache, game, undefined, { player, money: 2 });

  for (const card of game.players[player].board) {
    if (card.exhausted) {
      yield* defaultUtil.refreshCard(cache, game, card, { target: card });
    }

    yield* defaultUtil.getCardInfo(cache, game, card).turn();
  }

  for (const card of game.players[player].deck) {
    if (card.props.aflame > 0) {
      yield* defaultUtil.setProp(cache, game, card, {
        target: card,
        name: "aflame",
        value: card.props.aflame > 1 ? card.props.aflame - 1 : undefined,
      });

      if (card.props.aflame <= 1) {
        yield* defaultUtil.removeCard(cache, game, card, { target: card });
      }
    }
  }

  yield* defaultUtil.endTurn(cache, game, {});
}

function validateTargets(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  targets: Filter | undefined,
  target: Target | undefined
) {
  if (targets) {
    if (!target) {
      throw `${card.name} requires a target`;
    }

    if (!defaultUtil.getTargets(cache, game, card, targets).find((t) => t.id == target.id)) {
      const targetCard = getCard(game, target);
      throw `${card.name} cannot target ${targetCard?.name}`;
    }
  }
}

function* payCost(
  cache: CardInfoCache,
  game: GameState,
  card: Target,
  verb: string,
  name: string,
  colors: CardColor[],
  cost: CardCost,
  targets: Filter | undefined,
  prepared: Target[]
) {
  const player = currentPlayer(game);
  const result = defaultUtil.tryPayCost(cache, game, card, verb, name, player, colors, cost, targets, prepared);

  if (typeof result == "string") {
    throw result;
  }

  const { agents, money } = result;

  if (money > 0) {
    yield* defaultUtil.removeMoney(cache, game, card, { player, money });
  }

  for (const agent of agents) {
    yield* defaultUtil.exhaustCard(cache, game, card, { target: agent });
  }
}

function* playCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  const info = defaultUtil.getCardInfo(cache, game, card);

  validateTargets(cache, game, card, info.targets, target);

  yield* defaultUtil.playCard(cache, game, card, { target: card, type: info.type });
  yield* payCost(cache, game, card, "play", card.name, info.colors, info.cost, info.targets, prepared);
  yield* info.play(target!);
}

function* activateCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  if (card.exhausted) {
    throw `${card.name} is exhausted`;
  }

  const info = defaultUtil.getCardInfo(cache, game, card);

  if (!info.hasActivate) {
    throw `${card.name} has no activation effect`;
  }

  validateTargets(cache, game, card, info.activateTargets, target);

  yield* defaultUtil.exhaustCard(cache, game, card, { target: card });
  yield* payCost(
    cache,
    game,
    card,
    "activate",
    card.name,
    info.colors,
    info.activateCost,
    info.activateTargets,
    prepared
  );
  yield* info.activate(target!);
}

function* doCard(
  cache: CardInfoCache,
  game: GameState,
  id: string,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  const info = findCard(game, { id });
  if (info) {
    const { player, zone, index } = info;
    if (currentPlayer(game) != player) {
      throw `Cannot use opponent's cards`;
    }

    if (zone == "deck") {
      yield* playCard(cache, game, game.players[player][zone][index], target, prepared);
    } else if (zone == "board") {
      yield* activateCard(cache, game, game.players[player][zone][index], target, prepared);
    }
  }
}

function* doAction(cache: CardInfoCache, game: GameState, action: PlayerAction): CardGenerator {
  if (action.type == "end") {
    yield* doEndTurn(cache, game);
  } else if (action.type == "do") {
    yield* doCard(cache, game, action.id, action.target, action.prepared);
  }

  const toReveal: Target[] = [];
  for (const card of defaultUtil.filter(cache, game, { zones: ["board"], hidden: true })) {
    if (toReveal.some((c) => c.id == card.id)) {
      continue;
    }

    const player = findCard(game, card)?.player;
    if (player) {
      const opponent = opponentOf(player);
      const info = defaultUtil.getCardInfo(cache, game, card);
      const effectsOpponent = info.hasEffect && (info.effectFilter.players?.includes(opponent) ?? true);
      const secondaryEffectsOpponent =
        info.hasSecondaryEffect && (info.secondaryEffectFilter.players?.includes(opponent) ?? true);
      if (effectsOpponent || secondaryEffectsOpponent) {
        toReveal.push(card);
      }
    }
  }

  for (const target of toReveal) {
    yield revealCard({ target });
  }
}

function hasLost(cache: CardInfoCache, game: GameState, player: PlayerId) {
  return (
    defaultUtil.filter(cache, game, {
      players: [player],
      zones: ["deck", "board"],
      types: ["agent"],
      disloyal: false,
    }).length == 0
  );
}

function hasWinner(game: GameState): PlayerId | null {
  const cache = new Map();
  if (hasLost(cache, game, 0)) {
    return 1;
  } else if (hasLost(cache, game, 1)) {
    return 0;
  } else {
    return null;
  }
}

function* initalizePlayer(
  cache: CardInfoCache,
  state: HistoryState,
  player: PlayerId,
  init: PlayerInit
): CardGenerator {
  for (const [name, number] of Object.entries(init.deck.cards)) {
    for (let i = 0; i < number; i++) {
      yield* defaultUtil.addCard(cache, state.current, undefined, {
        target: defaultUtil.cid(),
        name,
        player,
        zone: "deck",
      });
    }
  }
}

export async function createGame(players: [Player, Player], onEnd: OnGameEnd) {
  let state = initialHistoryState();

  function sendActions(generator: CardGenerator, source: PlayerId, name: string) {
    const length = state.history.length;

    let newState = state;
    let next = generator.next(state.current);
    const historyActions: HistoryAction[] = [];
    while (!next.done) {
      const action = cleanAction(liftAction(newState.history.length, next.value));
      historyActions.push(action);
      newState = historySlice.reducer(newState, action);
      next = generator.next(newState.current);
    }

    state = newState;

    const gameActions = state.history.slice(length);

    for (const player of [0, 1] as const) {
      function hide(action: GameAction, i: number) {
        if (
          source != null &&
          action.payload.target &&
          player != source &&
          getCard(state.current, action.payload.target)?.hidden
        ) {
          return setHidden({ target: { id: action.payload.target.id }, index: length + i });
        } else {
          return setAction({ action, index: length + i });
        }
      }

      function reveal(action: GameAction) {
        if (action.type == "game/revealCard" && action.payload.target) {
          const id = action.payload.target.id;
          return state.history.flatMap((action, index) => {
            return action.payload.target?.id == id ? [setAction({ action, index })] : [];
          });
        } else {
          return [];
        }
      }

      players[player].send(
        [
          ...gameActions.map(hide),
          ...gameActions.flatMap(reveal),
          ...historyActions.filter((action) => action.type == "history/setUndone"),
        ],
        name
      );
    }
  }

  const cache = new Map();
  const inits = await Promise.all([players[0].init(), players[1].init()]);
  for (const player of [0, 1] as const) {
    const generator = initalizePlayer(cache, state, player, inits[player]);
    sendActions(generator, player, `player${player}/init`);
  }

  let hasEnded = false;

  function tryEndGame(winner: PlayerId) {
    if (hasEnded) {
      return;
    }

    hasEnded = true;
    players[0].end(winner);
    players[1].end(winner);
    onEnd(winner, players, inits, state);
  }

  for (const player of [0, 1] as const) {
    players[player].onAction((action) => {
      if (action == "concede") {
        tryEndGame(opponentOf(player));
        return;
      }

      if (player != currentPlayer(state.current)) {
        players[player].error("Not your turn");
        return;
      }

      try {
        const generator = doAction(new Map(), state.current, action);
        sendActions(generator, player, `player${player}/${action.type}Action`);

        const winner = hasWinner(state.current);
        if (winner != null) {
          tryEndGame(winner);
          return;
        }
      } catch (e) {
        if (typeof e == "string") {
          players[player].error(e);
        } else {
          console.error(e);
        }
      }
    });
  }
}
