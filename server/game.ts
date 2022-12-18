import Player, { PlayerAction } from "./Player";
import {
  createCard,
  endTurn,
  GameAction,
  gameSlice,
  GameState,
  getCard,
  initialGameState,
  moveCard,
  PlayerId,
  zones,
} from "../common/gameSlice";
import { getCardInfo } from "./card";
import util, { currentPlayer } from "../common/util";
import { Target } from "../common/card";
import { setAction, setHidden } from "../common/historySlice";

function* doEndTurn(game: GameState): Generator<GameAction, void, GameState> {
  const player = currentPlayer(game);

  for (const zone of zones) {
    for (const card of game.players[player][zone]) {
      yield* getCardInfo(game, card).turn();
    }
  }

  yield endTurn({});
}

function* playCard(id: string, target: Target | undefined, game: GameState): Generator<GameAction, void, GameState> {
  const player = currentPlayer(game);
  const card = game.players[player].deck.find((c) => c.id == id);
  if (!card) {
    throw `Card ${id} is not in deck`;
  }

  const info = getCardInfo(game, card);

  if (info.targets) {
    if (!target) {
      throw `Card ${id} requires a target`;
    }

    if (!info.targets().find((t) => t.id == target.id)) {
      throw `Card ${target.id} is not a valid target for ${id}`;
    }
  }

  yield* info.play(target!);

  if (info.type == "operation") {
    yield moveCard({
      card: { id },
      to: { player, zone: "graveyard" },
    });
  } else {
    yield moveCard({
      card: { id },
      to: { player, zone: "board" },
    });
  }
}

function* doAction(action: PlayerAction, game: GameState): Generator<GameAction, void, GameState> {
  if (action.type == "end") {
    yield* doEndTurn(game);
  } else if (action.type == "play") {
    yield* playCard(action.id, action.target, game);
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
        if (action.payload.card) {
          return player != source && getCard(state, action.payload.card)?.hidden
            ? setHidden({ card: { id: action.payload.card.id }, index: length + i })
            : setAction({ action, index: length + i });
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

    for (const card of init.deck.cards) {
      const action = createCard({
        card: util.cid(),
        name: card,
        player,
        zone: "deck",
      });

      state = gameSlice.reducer(state, action);
      actions.push(action);
    }

    sendActions(actions, player, `player${player}/init`);
  }

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      const generator = doAction(playerAction, state);
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
