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

  const toReveal: Set<string> = new Set();
  for (const card of util.filter(cache, game, { zones: ["board"], hidden: true })) {
    if (toReveal.has(card.id)) {
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
        toReveal.add(card.id);
      }
    }
  }

  for (const action of actions) {
    if (action.payload.target && !toReveal.has(action.payload.target.id) && action.payload.source) {
      const card = getCard(game, action.payload.source)!;
      if (card.hidden) {
        toReveal.add(card.id);
      }
    }
  }

  for (const id of toReveal) {
    actions.push(revealCard({ source: undefined, target: { id } }));
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

function* initializePlayer(player: PlayerId, init: PlayerInit): CardGenerator {
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
  let game = initialGameState();
  const revealed: { [player in PlayerId]: Set<string> } = {
    [0]: new Set(),
    [1]: new Set(),
  };

  function runActions(generator: CardGenerator): GameAction[] {
    const [actions, newState] = runCardGenerator(game, generator);
    game = newState;
    return actions;
  }

  function sendActions(actions: [GameAction[], GameAction[]]) {
    const toSend: [GameAction[], GameAction[]] = [[], []];

    for (const source of [0, 1] as const) {
      for (const toPlayer of [0, 1] as const) {
        const revealedActions = actions[source].filter(
          (action) => !action.payload.target || toPlayer == source || isRevealed(game, action.payload.target?.id)
        );

        const toRevealActions: GameAction[] = [];

        for (const action of revealedActions) {
          if (action.payload.target) {
            if (action.type == "game/addCard") {
              const { player } = findCard(game, action.payload.target)!;
              revealed[player].add(action.payload.target.id);
            }

            if (action.type == "game/revealCard" && !revealed[toPlayer].has(action.payload.target.id)) {
              const { player, zone, index } = findCard(game, action.payload.target)!;
              revealed[toPlayer].add(action.payload.target.id);
              toRevealActions.push(
                addCard({
                  source: undefined,
                  target: action.payload.target,
                  player,
                  zone,
                  state: game.players[player][zone][index],
                })
              );
            }

            const card = util.getCard(game, action.payload.target);
            const cardPlayer = util.findCard(game, card).player;
            getCosmetic(players[cardPlayer].id, card.name).then((cosmetic) =>
              players[toPlayer].cosmetic(card.id, cosmetic)
            );
          }
        }

        toSend[toPlayer].push(...[...revealedActions, ...toRevealActions]);
      }
    }

    for (const player of [0, 1] as const) {
      if (toSend[player].length > 0) {
        players[player].send(toSend[player]);
      }
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
      onEnd("draw", players, inits, game, false);
      return;
    }
  }

  sendActions([runActions(initializePlayer(0, inits[0])), runActions(initializePlayer(1, inits[1]))]);

  let hasEnded = false;

  function tryEndGame(winner: Winner) {
    if (hasEnded) {
      return;
    }

    hasEnded = true;
    players[0].end(winner);
    players[1].end(winner);
    onEnd(winner, players, inits, game, true);
  }

  async function payPlan(player: PlayerId) {
    const plan = await players[player].plan();
    const resources = planResources(cache, game, player, plan);
    if (typeof resources == "string") {
      players[player].error(`Cannot pay for plan: ${resources}`);
      return { actions: [], plan: [] };
    } else {
      return { actions: [removeMoney({ source: undefined, player, money: resources.moneyCost })], plan };
    }
  }

  while (!hasEnded) {
    cache.reset();
    const plans = await Promise.all(([0, 1] as const).map((x) => payPlan(x)));

    const actions: [GameAction[], GameAction[]] = [[], []];
    for (const player of [0, 1] as const) {
      actions[player].push(...plans[player].actions);

      for (const elem of plans[player].plan) {
        try {
          actions[player].push(...doPlayerAction(cache, game, player, elem.action));
        } catch (e) {
          if (typeof e == "string") {
            players[player].error(e);
          } else {
            throw e;
          }
        }
      }

      actions[player].push(...doEndTurn(cache, game, player));
    }

    runActions(
      (function* () {
        yield* actions[0];
        yield* actions[1];
      })()
    );

    sendActions(actions);

    const winner = hasWinner(cache, game);
    if (winner != null) {
      tryEndGame(winner);
      return;
    }
  }
}
