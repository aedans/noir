import Player from "./Player.js";
import {
  activateCard,
  addCard,
  addMoney,
  defaultCardState,
  endTurn,
  findCard,
  GameAction,
  GameState,
  getCard,
  initialGameState,
  opponentOf,
  playCard,
  PlayCardParams,
  PlayerId,
  refreshCard,
  removeMoney,
  revealCard,
  Winner,
} from "../common/gameSlice.js";
import { CardGenerator, CardState, runCardGenerator, Target } from "../common/card.js";
import util, { Filter, isRevealed, planResources, validateDeck } from "../common/util.js";
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

function* doEndTurn(cache: CardInfoCache, game: GameState, player: PlayerId): CardGenerator {
  yield endTurn({ source: undefined });

  for (const card of game.players[player].board) {
    yield refreshCard({ source: card, target: card });
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

function* doPlayCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined
): CardGenerator {
  const info = cache.getCardInfo(game, card);

  validateTargets(cache, game, card, info.targets, target);

  const payload: PlayCardParams = { source: card, target: card, type: info.type };

  yield playCard(payload);
  yield* info.play(target!);
}

function* doActivateCard(
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  target: Target | undefined
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
  yield* info.activate(target!);
}

function* doCard(
  cache: CardInfoCache,
  game: GameState,
  self: PlayerId,
  id: string,
  target: Target | undefined
): CardGenerator {
  const info = findCard(game, { id });
  if (info) {
    const { player, zone, index } = info;
    if (self != player) {
      throw `Cannot use opponent's cards`;
    }

    if (zone == "deck") {
      yield* doPlayCard(cache, game, game.players[player][zone][index], target);
    } else if (zone == "board") {
      yield* doActivateCard(cache, game, game.players[player][zone][index], target);
    }
  }
}

function* doGameAction(cache: CardInfoCache, game: GameState, action: GameAction, depth: number = 0): CardGenerator {
  if (depth >= 8) {
    yield action;
    return;
  }

  if (action.payload.target) {
    const card = getCard(game, action.payload.target);
    if (card) {
      const info = cache.getCardInfo(game, card);
      const [actions, _] = runCardGenerator(game, info.onTarget(action));

      for (const action of actions) {
        yield* doGameAction(cache, game, action, depth + 1);
      }
    }
  }

  yield action;
}

function* doPlayerAction(cache: CardInfoCache, game: GameState, player: PlayerId, action: PlayerAction): CardGenerator {
  const actions: GameAction[] = [];
  actions.push(...runCardGenerator(game, doCard(cache, game, player, action.id, action.target))[0]);

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
    actions.push(revealCard({ source: undefined, target }));
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

function* initializePlayer(cache: CardInfoCache, game: GameState, player: PlayerId, init: PlayerInit): CardGenerator {
  for (const [name, number] of Object.entries(init.deck.cards)) {
    for (let i = 0; i < number; i++) {
      const card = util.cid();
      yield addCard({
        source: card,
        target: card,
        state: defaultCardState(name, card.id),
        player,
        zone: "deck",
      });
    }
  }
}

export async function createGame(players: [Player, Player], onEnd: OnGameEnd) {
  let state = initialGameState();
  const revealed: { [player in PlayerId]: Set<string> } = {
    [0]: new Set(),
    [1]: new Set(),
  };

  function runActions(generator: CardGenerator): GameAction[] {
    const [actions, newState] = runCardGenerator(state, generator);
    state = newState;
    return actions;
  }

  function sendActions(actions: GameAction[], source: PlayerId) {
    for (const toPlayer of [0, 1] as const) {
      const revealedActions = actions.filter(
        (action) => !action.payload.target || toPlayer == source || isRevealed(state, action.payload.target?.id)
      );

      for (const action of revealedActions) {
        if (action.payload.target) {
          if (action.type == "game/addCard") {
            const { player } = findCard(state, action.payload.target)!;
            revealed[player].add(action.payload.target.id);
          }

          if (action.type == "game/revealCard" && !revealed[toPlayer].has(action.payload.target.id)) {
            const { player, zone, index } = findCard(state, action.payload.target)!;
            revealed[toPlayer].add(action.payload.target.id);
            players[toPlayer].send([
              addCard({
                source: undefined,
                target: action.payload.target,
                player,
                zone,
                state: state.players[player][zone][index],
              }),
            ]);
          }

          const card = util.getCard(state, action.payload.target);
          const cardPlayer = util.findCard(state, card).player;
          getCosmetic(players[cardPlayer].id, card.name).then((cosmetic) =>
            players[toPlayer].cosmetic(card.id, cosmetic)
          );
        }
      }

      players[toPlayer].send(revealedActions);
    }
  }

  const cache = new LocalCardInfoCache();
  const inits = await Promise.all([players[0].init(), players[1].init()]);
  for (const player of [0, 1] as const) {
    if (players[player].trusted) {
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
    const actions = runActions(generator);
    sendActions(actions, player);
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

  async function payTurn(player: PlayerId) {
    const turn = await players[player].turn();
    const resources = planResources(cache, state, player, turn);
    if (resources == false) {
      players[player].error("Cannot pay for planned turn");
      return await payTurn(player);
    } else {
      const actions = runActions(
        (function* () {
          yield removeMoney({ source: undefined, player, money: resources.moneyCost });
        })()
      );
      sendActions(actions, player);
      return turn;
    }
  }

  while (!hasEnded) {
    cache.reset();
    const turns = await Promise.all(([0, 1] as const).map((x) => payTurn(x)));

    const actions: { [player in PlayerId]: GameAction[] } = { [0]: [], [1]: [] };
    for (const player of [0, 1] as const) {
      for (const elem of turns[player]) {
        try {
          actions[player].push(...doPlayerAction(cache, state, player, elem.action));
        } catch (e) {
          if (typeof e == "string") {
            players[player].error(e);
          } else {
            throw e;
          }
        }
      }

      actions[player].push(...doEndTurn(cache, state, player));
    }

    runActions(
      (function* () {
        yield* actions[0];
        yield* actions[1];
      })()
    );

    for (const player of [0, 1] as const) {
      sendActions(actions[player], player);
    }

    const winner = hasWinner(cache, state);
    if (winner != null) {
      tryEndGame(winner);
      return;
    }
  }
}
