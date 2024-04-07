import Player from "./Player.js";
import {
  currentPlayer,
  findCard,
  GameAction,
  gameSlice,
  GameState,
  getCard,
  initialGameState,
  noop,
  opponentOf,
  PlayerId,
  revealCard,
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
  yield* util.addMoney(cache, game, undefined, { player, money: 2 });

  for (const card of game.players[player].board) {
    if (card.exhausted || card.activated) {
      yield* util.refreshCard(cache, game, card, { target: card });
    }

    yield* cache.getCardInfo(game, card).turn();
  }

  game = yield noop({});
  const agents = util.filter(cache, game, {
    types: ["agent"],
    zones: ["board"],
    players: [player],
    exhausted: false,
  });

  yield* util.endTurn(cache, game, {});

  yield* util.addAgents(cache, game, undefined, { player, agents: agents.length });
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
  targets: Filter | undefined
) {
  const player = currentPlayer(game);
  const result = util.tryPayCost(cache, game, card, verb, name, player, colors, cost, targets);

  if (typeof result == "string") {
    throw result;
  }

  const { agents, money } = result;

  if (money > 0) {
    yield* util.removeMoney(cache, game, card, { player, money });
  }

  if (agents > 0) {
    yield* util.removeAgents(cache, game, card, { player, agents });
  }
}

function* playCard(cache: CardInfoCache, game: GameState, card: CardState, target: Target | undefined): CardGenerator {
  const info = cache.getCardInfo(game, card);

  validateTargets(cache, game, card, info.targets, target);

  yield* util.playCard(cache, game, card, { target: card, type: info.type });
  yield* payCost(cache, game, card, "play", card.name, info.colors, info.cost, info.targets);
  yield* info.play(target!);
}

function* activateCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined
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
  yield* payCost(cache, game, card, "activate", card.name, info.colors, info.activateCost, info.activateTargets);
  yield* info.activate(target!);
}

function* doCard(cache: CardInfoCache, game: GameState, id: string, target: Target | undefined): CardGenerator {
  const info = findCard(game, { id });
  if (info) {
    const { player, zone, index } = info;
    if (currentPlayer(game) != player) {
      throw `Cannot use opponent's cards`;
    }

    if (zone == "deck") {
      yield* playCard(cache, game, game.players[player][zone][index], target);
    } else if (zone == "board") {
      yield* activateCard(cache, game, game.players[player][zone][index], target);
    }
  }
}

function* doAction(cache: CardInfoCache, game: GameState, action: PlayerAction): CardGenerator {
  if (action.type == "end") {
    yield* doEndTurn(cache, game);
  } else if (action.type == "do") {
    yield* doCard(cache, game, action.id, action.target);
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
