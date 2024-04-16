import Player from "./Player.js";
import {
  currentPlayer,
  endTurn,
  findCard,
  GameAction,
  gameSlice,
  GameState,
  getCard,
  initialGameState,
  noop,
  opponentOf,
  playCard,
  PlayCardParams,
  PlayerId,
  revealCard,
  setProp,
  Winner,
} from "../common/gameSlice.js";
import { CardColor, CardCost, CardGenerator, CardState, Target } from "../common/card.js";
import util, { Filter, isRevealed, validateDeck } from "../common/util.js";
import { PlayerAction, PlayerInit } from "../common/network.js";
import CardInfoCache from "../common/CardInfoCache.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import { getCosmetic } from "./cosmetics.js";

export type OnGameEnd = (
  winner: Winner,
  players: [Player, Player],
  inits: [PlayerInit, PlayerInit],
  state: GameState,
  isValid: boolean
) => void;

function* doEndTurn(cache: CardInfoCache, game: GameState): CardGenerator {
  const player = currentPlayer(game);

  yield endTurn({});

  for (const card of game.players[player].board) {
    if (card.exhausted) {
      yield* util.refreshCard(cache, game, card, { target: card });
    }

    if (card.props.delayed != undefined) {
      yield* util.setProp(cache, game, card, {
        target: card,
        name: "delayed",
        value: card.props.delayed > 1 ? card.props.delayed - 1 : undefined,
      });
      yield* util.exhaustCard(cache, game, card, { target: card });
      yield* util.activateCard(cache, game, card, { target: card });
    }

    const minDepart = cache
      .getCardInfo(game, card)
      .keywords.filter((k): k is ["depart", number] => k[0] == "depart")
      .reduce((a, b) => Math.min(a, b[1]), 1000);

    if (minDepart < 1000 && (card.props.departing ?? 1000) >= minDepart) {
      yield setProp({ target: card, name: "departing", value: minDepart - 1 });
    }

    if (card.props.departing > 0) {
      yield setProp({
        target: card,
        name: "departing",
        value: card.props.departing > 1 ? card.props.departing - 1 : undefined,
      });

      if (card.props.departing <= 1) {
        yield* util.removeCard(cache, game, card, { target: card });
      }
    }

    if (card.props.collection != undefined) {
      yield* util.setProp(cache, game, card, {
        target: card,
        name: "collection",
        value: card.props.collection > 1 ? card.props.collection - 1 : undefined,
      });

      if (card.props.collection <= 0) {
        const player = util.findCard(game, card)?.player;
        const info = cache.getCardInfo(game, card);
        const money = info.keywords.filter((k): k is ["debt", number] => k[0] == "debt").reduce((a, b) => a + b[1], 0);
        yield* util.removeMoney(cache, game, card, { player, money });

        if (info.type == "operation") {
          yield* util.removeCard(cache, game, card, { target: card });
        }
      }
    }

    yield* cache.getCardInfo(game, card).turn();
  }

  yield* util.addMoney(cache, game, undefined, { player, money: 2 });
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

function* doPlayCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  const info = cache.getCardInfo(game, card);

  validateTargets(cache, game, card, info.targets, target);

  const totalTribute = {
    cards: info.keywords.filter(([name, type]) => name == "tribute" && type == "card").length,
    agents: info.keywords.filter(([name, type]) => name == "tribute" && type == "agent").length,
    operations: info.keywords.filter(([name, type]) => name == "tribute" && type == "operation").length,
  };

  const lowestCards = util.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["operation"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  const lowestAgents = util.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["agent"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  const lowestOperations = util.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["operation"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  if (lowestCards.length < totalTribute.cards) {
    throw "Not enough cards to tribute";
  }

  if (lowestAgents.length < totalTribute.agents) {
    throw "Not enough agents to tribute";
  }

  if (lowestOperations.length < totalTribute.operations) {
    throw "Not enough operations to tribute";
  }

  const payload: PlayCardParams = { source: card, target: card, type: info.type };

  yield playCard(payload);

  yield* info.onPlay(payload);

  const totalDelay = info.keywords.filter((k): k is ["delay", number] => k[0] == "delay").reduce((a, b) => a + b[1], 0);
  if (totalDelay > 0) {
    yield setProp({ target: payload.target, name: "delayed", value: totalDelay });
  }

  if (info.keywords.some((k) => k[0] == "debt")) {
    yield setProp({ target: payload.target, name: "collection", value: 2 });

    if (info.type == "operation") {
      yield* util.enterCard(cache, game, card, { target: card });
    }
  }

  for (const target of [
    ...lowestCards.slice(0, totalTribute.cards),
    ...lowestAgents.slice(0, totalTribute.agents),
    ...lowestOperations.slice(0, totalTribute.operations),
  ]) {
    yield* util.removeCard(cache, game, card, { target });
  }

  if (info.type == "operation") {
    yield* info.onRemove(payload);
  } else {
    yield* info.onEnter(payload);
  }

  yield* payCost(cache, game, card, "play", card.name, info.colors, info.cost, info.targets, prepared);
  yield* info.play(target!);
}

function* doActivateCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined,
  prepared: Target[]
): CardGenerator {
  if (card.exhausted) {
    throw `${card.name} is already exhausted`;
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
      yield* doPlayCard(cache, game, game.players[player][zone][index], target, prepared);
    } else if (zone == "board") {
      yield* doActivateCard(cache, game, game.players[player][zone][index], target, prepared);
    }
  }
}

function* doAction(cache: CardInfoCache, game: GameState, action: PlayerAction): CardGenerator {
  if (action.type == "end") {
    yield* doEndTurn(cache, game);
  } else if (action.type == "do") {
    yield* doCard(cache, game, action.id, action.target, action.prepared);
  }

  const toReveal: CardState[] = [];
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
    const { zone, player } = findCard(game, target)!;
    yield revealCard({ target, zone, player });
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

function* initializePlayer(cache: CardInfoCache, state: GameState, player: PlayerId, init: PlayerInit): CardGenerator {
  for (const [name, number] of Object.entries(init.deck.cards)) {
    for (let i = 0; i < number; i++) {
      yield* util.addCard(cache, state, undefined, {
        target: util.cid(),
        name,
        player,
        zone: "deck",
      });
    }
  }
}

export async function createGame(players: [Player, Player], onEnd: OnGameEnd) {
  let state = initialGameState();

  function sendActions(generator: CardGenerator, source: PlayerId, name: string) {
    let next = generator.next(state);
    const actions: GameAction[] = [];
    while (!next.done) {
      actions.push(next.value);
      state = gameSlice.reducer(state, next.value);
      next = generator.next(state);
    }

    for (const player of [0, 1] as const) {
      const revealedActions = actions
        .filter((x) => x.type != "game/noop")
        .filter((action) => !action.payload.target || player == source || isRevealed(state, action.payload.target?.id));

      for (const action of revealedActions) {
        if (action.type == "game/revealCard" && action.payload.target) {
          const card = util.getCard(state, action.payload.target);
          const cardPlayer = util.findCard(state, card).player;
          getCosmetic(players[cardPlayer].id, card.name).then((cosmetic) =>
            players[player].cosmetic(card.id, cosmetic)
          );
        }
      }

      players[player].send(revealedActions, name);
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
    const generator = initializePlayer(cache, state, player, inits[player]);
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

      if (player != currentPlayer(state)) {
        players[player].error("Not your turn");
        return;
      }

      try {
        cache.reset();
        const generator = doAction(cache, state, action);
        sendActions(generator, player, `player${player}/${action.type}Action`);

        const winner = hasWinner(cache, state);
        if (winner != null) {
          tryEndGame(winner);
          return;
        }
      } catch (e) {
        if (typeof e == "string") {
          players[player].error(e);
        } else {
          throw e;
        }
      }
    });
  }
}
