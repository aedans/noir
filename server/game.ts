import Player from "./Player.js";
import {
  activateCard,
  addCard,
  addMoney,
  currentPlayer,
  endTurn,
  enterCard,
  exhaustCard,
  findCard,
  GameAction,
  gameSlice,
  GameState,
  getCard,
  initialGameState,
  opponentOf,
  playCard,
  PlayCardParams,
  PlayerId,
  refreshCard,
  removeCard,
  removeMoney,
  revealCard,
  setProp,
  Winner,
} from "../common/gameSlice.js";
import { CardColor, CardCost, CardGenerator, CardState, runCardGenerator, Target } from "../common/card.js";
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

  yield endTurn({ source: undefined });

  for (const card of game.players[player].board) {
    if (card.exhausted) {
      yield refreshCard({ source: card, target: card });
    }

    if (card.props.delayed != undefined) {
      yield setProp({
        source: card,
        target: card,
        name: "delayed",
        value: card.props.delayed > 1 ? card.props.delayed - 1 : undefined,
      });
      yield exhaustCard({ source: card, target: card });
      yield activateCard({ source: card, target: card });
    }

    const minDepart = cache
      .getCardInfo(game, card)
      .keywords.filter((k): k is ["depart", number] => k[0] == "depart")
      .reduce((a, b) => Math.min(a, b[1]), 1000);

    if (minDepart < 1000 && (card.props.departing ?? 1000) >= minDepart) {
      yield setProp({ source: card, target: card, name: "departing", value: minDepart - 1 });
    }

    if (card.props.departing > 0) {
      yield setProp({
        source: card,
        target: card,
        name: "departing",
        value: card.props.departing > 1 ? card.props.departing - 1 : undefined,
      });

      if (card.props.departing <= 1) {
        yield removeCard({ source: card, target: card });
      }
    }

    if (card.props.collection != undefined) {
      yield setProp({
        source: card,
        target: card,
        name: "collection",
        value: card.props.collection > 1 ? card.props.collection - 1 : undefined,
      });

      if (card.props.collection <= 1) {
        const player = findCard(game, card)!.player;
        const info = cache.getCardInfo(game, card);
        const money = info.keywords.filter((k): k is ["debt", number] => k[0] == "debt").reduce((a, b) => a + b[1], 0);
        yield removeMoney({ source: card, player, money });

        if (info.type == "operation") {
          yield removeCard({ source: card, target: card });
        }
      }
    }

    yield* cache.getCardInfo(game, card).turn();
  }

  yield addMoney({ source: undefined, player, money: 2 });
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
    yield removeMoney({ source: card, player, money });
  }

  for (const agent of agents) {
    yield exhaustCard({ source: card, target: agent });
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

  const totalDelay = info.keywords.filter((k): k is ["delay", number] => k[0] == "delay").reduce((a, b) => a + b[1], 0);
  if (totalDelay > 0) {
    yield setProp({ source: card, target: payload.target, name: "delayed", value: totalDelay });
  }

  if (info.keywords.some((k) => k[0] == "debt")) {
    yield setProp({ source: card, target: payload.target, name: "collection", value: 3 });

    if (info.type == "operation") {
      yield enterCard({ source: card, target: card });
    }
  }

  for (const target of [
    ...lowestCards.slice(0, totalTribute.cards),
    ...lowestAgents.slice(0, totalTribute.agents),
    ...lowestOperations.slice(0, totalTribute.operations),
  ]) {
    yield removeCard({ source: card, target });
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

  yield activateCard({ source: card, target: card });
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

function* doGameAction(cache: CardInfoCache, game: GameState, action: GameAction, depth: number = 0): CardGenerator {
  yield action;

  if (depth >= 8) {
    return;
  }
  
  if (action.payload.target) {
    const card = getCard(game, action.payload.target);
    if (card) {
      const info = cache.getCardInfo(game, card);
      const [actions] = runCardGenerator(game, info.onTarget(action));
      for (const action of actions) {
        yield* doGameAction(cache, game, action, depth + 1);
      }
    }
  }
}

function* doPlayerAction(cache: CardInfoCache, game: GameState, action: PlayerAction): CardGenerator {
  const actions: GameAction[] = [];
  if (action.type == "end") {
    actions.push(...runCardGenerator(game, doEndTurn(cache, game))[0]);
  } else if (action.type == "do") {
    actions.push(...runCardGenerator(game, doCard(cache, game, action.id, action.target, action.prepared))[0]);
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
    actions.push(revealCard({ source: undefined, target, zone, player }));
  }
  
  for (const action of actions) {
    yield* doGameAction(cache, game, action);
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
      const card = util.cid();
      yield addCard({
        source: card,
        target: card,
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
    const [actions, newState] = runCardGenerator(state, generator)
    state = newState;

    for (const player of [0, 1] as const) {
      const revealedActions = actions
        .filter((x) => x.type != "game/noop")
        .filter((action) => !action.payload.target || player == source || isRevealed(state, action.payload.target?.id));

      for (const action of revealedActions) {
        if (action.payload.target) {
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
        const generator = doPlayerAction(cache, state, action);
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
