import Player, { PlayerAction, PlayerInit } from "./Player";
import { findCard, GameAction, GameState, getCard, PlayerId } from "../common/gameSlice";
import { defaultUtil, getCardInfo } from "./card";
import { currentPlayer } from "../common/util";
import { CardColor, CardCost, CardGenerator, CardState, Target } from "../common/card";
import {
  HistoryAction,
  historySlice,
  HistoryState,
  initialHistoryState,
  setAction,
  setHidden,
} from "../common/historySlice";

function* doEndTurn(game: GameState): CardGenerator {
  const player = currentPlayer(game);
  yield* defaultUtil.addMoney(game, { player, money: 2 });

  for (const card of game.players[player].board) {
    if (card.exhausted) {
      yield* defaultUtil.refreshCard(game, { card });
    }

    yield* getCardInfo(game, card).turn();
  }

  yield* defaultUtil.endTurn(game, {});
}

function validateTargets(
  game: GameState,
  card: CardState,
  targets: (() => Target[]) | undefined,
  target: Target | undefined
) {
  if (targets) {
    if (!target) {
      throw `${card.name} requires a target`;
    }

    if (!targets().find((t) => t.id == target.id)) {
      const targetCard = getCard(game, target);
      throw `${card.name} cannot target ${targetCard?.name}`;
    }
  }
}

function* payCost(game: GameState, card: Target, verb: string, name: string, colors: CardColor[], cost: CardCost) {
  const player = currentPlayer(game);
  const result = defaultUtil.tryPayCost(game, card, verb, name, player, colors, cost);

  if (typeof result == "string") {
    throw result;
  }

  const { agents, money } = result;

  if (money > 0) {
    yield* defaultUtil.removeMoney(game, { player, money });
  }

  for (const card of agents) {
    yield* defaultUtil.exhaustCard(game, { card });
  }
}

function* playCard(game: GameState, card: CardState, target: Target | undefined): CardGenerator {
  const info = getCardInfo(game, card);

  validateTargets(game, card, info.targets, target);

  if (info.type == "operation") {
    yield* defaultUtil.removeCard(game, { card });
  } else {
    yield* defaultUtil.enterCard(game, { card });
  }

  yield* payCost(game, card, "play", card.name, info.colors, info.cost);
  yield* info.play(target!);
}

function* activateCard(game: GameState, card: CardState, target: Target | undefined): CardGenerator {
  if (card.exhausted) {
    throw `${card.name} is exhausted`;
  }

  const info = getCardInfo(game, card);

  if (!info.hasActivateEffect) {
    throw `${card.name} has no activation effect`;
  }

  validateTargets(game, card, info.activateTargets, target);

  yield* defaultUtil.exhaustCard(game, { card });
  yield* payCost(game, card, "activate", card.name, info.colors, info.activateCost);
  yield* info.activate(target!);
}

function* doCard(game: GameState, id: string, target: Target | undefined): CardGenerator {
  const info = findCard(game, { id });
  if (info) {
    const { player, zone, index } = info;
    if (currentPlayer(game) != player) {
      throw `Cannot use opponent's cards`;
    }

    if (zone == "deck") {
      yield* playCard(game, game.players[player][zone][index], target);
    } else if (zone == "board") {
      yield* activateCard(game, game.players[player][zone][index], target);
    }
  }
}

function* doAction(game: GameState, action: PlayerAction): CardGenerator {
  if (action.type == "end") {
    yield* doEndTurn(game);
  } else if (action.type == "do") {
    yield* doCard(game, action.id, action.target);
  }
}

function* initalizePlayer(state: HistoryState, player: PlayerId, init: PlayerInit): CardGenerator {
  for (const [name, number] of Object.entries(init.deck.cards)) {
    for (let i = 0; i < number; i++) {
      yield* defaultUtil.addCard(state.current, {
        card: defaultUtil.cid(),
        name,
        player,
        zone: "deck",
      });
    }
  }
}

function liftAction(state: HistoryState, action: GameAction | HistoryAction): HistoryAction {
  if (action.type.startsWith("history")) {
    return action as HistoryAction;
  } else {
    return setAction({
      index: state.history.length,
      action: action as GameAction,
    });
  }
}

export async function createGame(players: [Player, Player]) {
  let state = initialHistoryState;

  function sendActions(generator: CardGenerator, source: PlayerId, name: string) {
    const length = state.history.length;

    let next = generator.next(state.current);
    const historyActions: HistoryAction[] = [];
    while (!next.done) {
      const action = liftAction(state, next.value);
      historyActions.push(action);
      state = historySlice.reducer(state, action);
      next = generator.next(state.current);
    }

    const gameActions = state.history.slice(length);

    for (const player of [0, 1] as const) {
      function hide(action: GameAction, i: number) {
        if (action.payload.card && player != source && getCard(state.current, action.payload.card)?.hidden) {
          return setHidden({ card: { id: action.payload.card.id }, index: length + i });
        } else {
          return setAction({ action, index: length + i });
        }
      }

      function reveal(action: GameAction) {
        if (action.type == "game/revealCard" && action.payload.card) {
          const id = action.payload.card.id;
          return state.history.flatMap((action, index) => {
            return action.payload.card?.id == id ? [setAction({ action, index })] : [];
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

  for (const player of [0, 1] as const) {
    const init = await players[player].init(player);
    const generator = initalizePlayer(state, player, init);
    sendActions(generator, player, `player${player}/init`);
  }

  while (true) {
    const player = currentPlayer(state.current);
    const playerAction = await players[player].receive();

    try {
      const generator = doAction(state.current, playerAction);
      sendActions(generator, player, `player${player}/${playerAction.type}Action`);
    } catch (e) {
      if (typeof e == "string") {
        players[player].error(e);
      } else {
        console.error(e);
      }
    }
  }
}
