import Player, { PlayerAction } from "./Player";
import { findCard, GameAction, gameSlice, GameState, getCard, initialGameState, PlayerId } from "../common/gameSlice";
import { defaultUtil, getCardInfo } from "./card";
import { currentPlayer } from "../common/util";
import { CardColor, CardCost, CardState, Target } from "../common/card";
import { setAction, setHidden } from "../common/historySlice";

function* doEndTurn(game: GameState): Generator<GameAction, void, GameState> {
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

function* payCost(game: GameState, verb: string, name: string, colors: CardColor[], cost: CardCost) {
  const player = currentPlayer(game);

  if (game.players[player].money < cost.money) {
    throw `Not enough money to ${verb} ${name}`;
  }

  const agents = defaultUtil.filter(game, {
    players: [player],
    types: ["agent"],
    zones: ["board"],
    colors,
  });

  if (agents.length < cost.agents) {
    throw `Not enough agents to ${verb} ${name}`;
  }

  agents.sort((a, b) => getCardInfo(game, b).activationPriority - getCardInfo(game, a).activationPriority);

  if (cost.money > 0) {
    yield* defaultUtil.removeMoney(game, { player, money: cost.money });
  }
  
  for (const card of agents.slice(0, cost.agents)) {
    yield* defaultUtil.exhaustCard(game, { card });
  }
}

function* playCard(
  game: GameState,
  card: CardState,
  target: Target | undefined
): Generator<GameAction, void, GameState> {
  const player = currentPlayer(game);
  const info = getCardInfo(game, card);

  validateTargets(game, card, info.targets, target);

  if (info.type == "operation") {
    yield* defaultUtil.moveCard(game, {
      card,
      to: { player, zone: "graveyard" },
    });
  } else {
    yield* defaultUtil.moveCard(game, {
      card,
      to: { player, zone: "board" },
    });
  }

  yield* payCost(game, "play", card.name, info.colors, info.cost);
  yield* info.play(target!);
}

function* activateCard(
  game: GameState,
  card: CardState,
  target: Target | undefined
): Generator<GameAction, void, GameState> {
  if (card.exhausted) {
    throw `${card.name} is exhausted`;
  }

  const info = getCardInfo(game, card);

  if (!info.hasActivateEffect) {
    throw `${card.name} has no activation effect`;
  }

  validateTargets(game, card, info.activateTargets, target);

  yield* defaultUtil.exhaustCard(game, { card });
  yield* payCost(game, "activate", card.name, info.colors, info.activateCost);
  yield* info.activate(target!);
}

function* doCard(game: GameState, id: string, target: Target | undefined): Generator<GameAction, void, GameState> {
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

function* doAction(game: GameState, action: PlayerAction): Generator<GameAction, void, GameState> {
  if (action.type == "end") {
    yield* doEndTurn(game);
  } else if (action.type == "do") {
    yield* doCard(game, action.id, action.target);
  }
}

export async function createGame(players: [Player, Player]) {
  let state = initialGameState;
  const history: GameAction[] = [];

  function sendActions(actions: GameAction[], source: PlayerId, name: string) {
    const length = history.length;
    history.push(...actions);

    for (const player of [0, 1] as const) {
      function hide(action: GameAction, i: number) {
        if (action.payload.card && player != source && getCard(state, action.payload.card)?.hidden) {
          return setHidden({ card: { id: action.payload.card.id }, index: length + i });
        } else {
          return setAction({ action, index: length + i });
        }
      }

      function reveal(action: GameAction) {
        if (action.type == "game/revealCard" && action.payload.card) {
          const id = action.payload.card.id;
          return history.flatMap((action, index) => {
            return action.payload.card?.id == id ? [setAction({ action, index })] : [];
          });
        } else {
          return [];
        }
      }

      players[player].send([...actions.map(hide), ...actions.flatMap(reveal)], name);
    }
  }

  for (const player of [0, 1] as const) {
    const init = await players[player].init(player);
    const actions: GameAction[] = [];

    for (const [name, number] of Object.entries(init.deck.cards)) {
      for (let i = 0; i < number; i++) {
        const generator = defaultUtil.addCard(state, {
          card: defaultUtil.cid(),
          name,
          player,
          zone: "deck",
        });

        let next = generator.next(state);
        while (!next.done) {
          state = gameSlice.reducer(state, next.value);
          actions.push(next.value);
          next = generator.next(state);
        }
      }
    }

    sendActions(actions, player, `player${player}/init`);
  }

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      const generator = doAction(state, playerAction);
      let newState = state;
      let actions: GameAction[] = [];
      let next = generator.next(newState);
      while (!next.done) {
        newState = gameSlice.reducer(newState, next.value);
        actions.push(next.value);
        next = generator.next(newState);
      }

      sendActions(actions, player, `player${player}/${playerAction.type}Action`);
      state = newState;
    } catch (e) {
      if (typeof e == "string") {
        players[player].error(e);
      } else {
        console.error(e);
      }
    }
  }
}
