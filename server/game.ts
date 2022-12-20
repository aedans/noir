import Player, { PlayerAction } from "./Player";
import {
  createCard,
  endTurn,
  exhaustCard,
  findCard,
  GameAction,
  gameSlice,
  GameState,
  getCard,
  initialGameState,
  moveCard,
  PlayerId,
  prepareCard,
} from "../common/gameSlice";
import { getCardInfo } from "./card";
import util, { currentPlayer } from "../common/util";
import { CardState, Target } from "../common/card";
import { setAction, setHidden } from "../common/historySlice";

function* doEndTurn(game: GameState): Generator<GameAction, void, GameState> {
  const player = currentPlayer(game);

  for (const card of game.players[player].board) {
    if (!card.prepared) {
      yield prepareCard({ card });
    }

    yield* getCardInfo(game, card).turn();
  }

  game = yield endTurn({});
}

function validateTargets(card: CardState, targets: (() => Target[]) | undefined, target: Target | undefined) {
  if (targets) {
    if (!target) {
      throw `Card ${card.id} requires a target`;
    }

    if (!targets().find((t) => t.id == target.id)) {
      throw `Card ${target.id} is not a valid target for ${card.id}`;
    }
  }
}

function* playCard(
  game: GameState,
  card: CardState,
  target: Target | undefined
): Generator<GameAction, void, GameState> {
  const player = currentPlayer(game);
  const info = getCardInfo(game, card);
  validateTargets(card, info.targets, target);

  yield* info.play(target!);

  if (info.type == "operation") {
    yield moveCard({
      card,
      to: { player, zone: "graveyard" },
    });
  } else {
    yield moveCard({
      card,
      to: { player, zone: "board" },
    });
  }
}

function* useCard(
  game: GameState,
  card: CardState,
  target: Target | undefined
): Generator<GameAction, void, GameState> {
  if (!card.prepared) {
    throw `Card ${card.id} is not prepared`;
  }

  const info = getCardInfo(game, card);
  validateTargets(card, info.activateTargets, target);

  yield exhaustCard({ card });
  yield* info.activate(target!);
}

function* doCard(game: GameState, id: string, target: Target | undefined): Generator<GameAction, void, GameState> {
  const info = findCard(game, { id });
  if (info) {
    const { player, zone, index } = info;
    if (currentPlayer(game) != player) {
      throw `Card ${id} is not owned by ${currentPlayer(game)}`;
    }

    if (zone == "deck") {
      yield* playCard(game, game.players[player][zone][index], target);
    } else if (zone == "board") {
      yield* useCard(game, game.players[player][zone][index], target);
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
        const action = createCard({
          card: util.cid(),
          name,
          player,
          zone: "deck",
        });

        state = gameSlice.reducer(state, action);
        actions.push(action);
      }
    }

    sendActions(actions, player, `player${player}/init`);
  }

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      const generator = doAction(state, playerAction);
      let actions: GameAction[] = [];
      let next = generator.next(state);
      while (!next.done) {
        state = gameSlice.reducer(state, next.value);
        actions.push(next.value);
        next = generator.next(state);
      }

      sendActions(actions, player, `player${player}/${playerAction.type}Action`);
    } catch (e) {
      console.error(e);
    }
  }
}
