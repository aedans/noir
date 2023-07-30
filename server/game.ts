import Player from "./Player.js";
import {
  currentPlayer,
  findCard,
  GameAction,
  GameState,
  getCard,
  opponentOf,
  PlayerId,
  revealCard,
  Winner,
} from "../common/gameSlice.js";
import { CardColor, CardCost, CardGenerator, CardState, Target } from "../common/card.js";
import {
  HistoryAction,
  historySlice,
  HistoryState,
  initialHistoryState,
  setAction,
  setHidden,
  liftAction,
  cleanAction,
} from "../common/historySlice.js";
import util, { Filter, validateDeck } from "../common/util.js";
import { PlayerAction, PlayerInit } from "../common/network.js";
import CardInfoCache from "../common/CardInfoCache.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import { getCosmetic } from "./cosmetics.js";

export type OnGameEnd = (
  winner: Winner,
  players: [Player, Player],
  inits: [PlayerInit, PlayerInit],
  state: HistoryState,
  isValid: boolean
) => void;

function* doEndTurn(cache: CardInfoCache, game: GameState): CardGenerator {
  const player = currentPlayer(game);
  yield* util.addMoney(cache, game, undefined, { player, money: 2 });

  for (const card of game.players[player].board) {
    if (card.exhausted || card.activated) {
      yield* util.refreshCard(cache, game, card, { target: card });
    }

    yield* cache.getCardInfo(game, card).turn();
  }

  for (const card of game.players[player].deck) {
    if (card.props.aflame > 0) {
      yield* util.setProp(cache, game, card, {
        target: card,
        name: "aflame",
        value: card.props.aflame > 1 ? card.props.aflame - 1 : undefined,
      });

      if (card.props.aflame <= 1) {
        yield* util.removeCard(cache, game, card, { target: card });
      }
    }
  }

  yield* util.endTurn(cache, game, {});
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

    if (!util.getTargets(cache, game, card, targets).find((t) => t.id == target.id)) {
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
  const result = util.tryPayCost(cache, game, card, verb, name, player, colors, cost, targets, prepared);

  if (typeof result == "string") {
    throw result;
  }

  const { agents, money } = result;

  if (money > 0) {
    yield* util.removeMoney(cache, game, card, { player, money });
  }

  for (const agent of agents) {
    yield* util.exhaustCard(cache, game, card, { target: agent });
  }
}

function* playCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  const info = cache.getCardInfo(game, card);

  validateTargets(cache, game, card, info.targets, target);

  yield* util.playCard(cache, game, card, { target: card, type: info.type });
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
  if (card.activated) {
    throw `${card.name} has already been activated`;
  }

  const info = cache.getCardInfo(game, card);

  if (!info.hasActivate) {
    throw `${card.name} has no activation effect`;
  }

  validateTargets(cache, game, card, info.activateTargets, target);

  yield* util.activateCard(cache, game, card, { target: card });
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
  for (const card of util.filter(cache, game, { zones: ["board"], hidden: true })) {
    if (toReveal.some((c) => c.id == card.id)) {
      continue;
    }

    const player = findCard(game, card)?.player;
    if (player != undefined) {
      const opponent = opponentOf(player);
      const info = cache.getCardInfo(game, card);
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
    util.filter(cache, game, {
      players: [player],
      zones: ["deck", "board"],
      types: ["agent"],
      disloyal: false,
    }).length == 0
  );
}

function hasWinner(cache: CardInfoCache, game: GameState): Winner | null {
  if (hasLost(cache, game, 0)) {
    return 1;
  } else if (hasLost(cache, game, 1)) {
    return 0;
  } else if (game.turn >= 100) {
    return "draw";
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
      yield* util.addCard(cache, state.current, undefined, {
        target: util.cid(),
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
      const action = cleanAction(liftAction(newState.history.length, next.value as GameAction));
      historyActions.push(action);
      newState = historySlice.reducer(newState, action);
      next = generator.next(newState.current);
    }

    state = newState;

    const gameActions = state.history.slice(length);

    for (const player of [0, 1] as const) {
      function isHidden(action: GameAction) {
        return (
          source != null &&
          action.payload.target &&
          player != source &&
          getCard(state.current, action.payload.target)?.hidden
        );
      }

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

      const actions = [
        ...gameActions.map(hide),
        ...gameActions.flatMap(reveal),
        ...historyActions.filter((action) => action.type == "history/setUndone"),
      ];

      actions.sort((a, b) => a.payload.index - b.payload.index);

      for (const action of gameActions) {
        if (
          (action.type == "game/revealCard" || (action.type == "game/addCard" && !isHidden(action))) &&
          action.payload.target
        ) {
          const card = util.getCard(state.current, action.payload.target);
          getCosmetic(players[player].id, card.name).then((cosmetic) => players[player].cosmetic(card.id, cosmetic));
        }
      }

      players[player].send(actions, name);
    }
  }

  const cache = new LocalCardInfoCache();
  const inits = await Promise.all([players[0].init(), players[1].init()]);
  for (const player of [0, 1] as const) {
    if (players[player].ai) {
      continue;
    }

    const { errors } = validateDeck(cache, inits[player].deck);
    if (errors.length > 0) {
      players[player].error(errors[0]);
      players[0].end("draw");
      players[1].end("draw");
      onEnd("draw", players, inits, state, false);
      return;
    }
  }

  for (const player of [0, 1] as const) {
    const generator = initalizePlayer(cache, state, player, inits[player]);
    sendActions(generator, player, `player${player}/init`);
  }

  let hasEnded = false;

  function tryEndGame(winner: Winner) {
    if (hasEnded) {
      return;
    }

    hasEnded = true;
    players[0].end(winner);
    players[1].end(winner);
    onEnd(winner, players, inits, state, true);
  }

  for (const player of [0, 1] as const) {
    players[player].onAction((action) => {
      if (hasEnded) {
        return;
      }

      if (action == "concede") {
        tryEndGame(opponentOf(player));
        return;
      }

      if (player != currentPlayer(state.current)) {
        players[player].error("Not your turn");
        return;
      }

      try {
        cache.reset();
        const generator = doAction(cache, state.current, action);
        sendActions(generator, player, `player${player}/${action.type}Action`);

        const winner = hasWinner(cache, state.current);
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
