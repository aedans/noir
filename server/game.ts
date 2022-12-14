import Player, { PlayerAction } from "./Player";
import { createCard, endTurn, gameSlice, GameState, initialState, moveCard, zones } from "../common/gameSlice";
import { getCardInfo } from "./card";
import { currentPlayer } from "../common/util";
import { Action } from "redux";
import { Target } from "../common/card";

function* beginTurn(game: GameState): Generator<Action, void, GameState> {
  const player = currentPlayer(game);

  for (const zone of zones) {
    for (const card of game.players[player][zone]) {
      yield* getCardInfo(game, card).turn();
    }
  }
}

function* playCard(id: string, target: Target | undefined, game: GameState): Generator<Action, void, GameState> {
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

function* doAction(action: PlayerAction, game: GameState): Generator<Action, void, GameState> {
  if (action.type == "end") {
    game = yield endTurn();
    yield* beginTurn(game);
  } else if (action.type == "play") {
    yield* playCard(action.id, action.target, game);
  }
}

export async function createGame(players: [Player, Player]) {
  let state = initialState;

  for (const player of [0, 1] as const) {
    const init = await players[player].init(player);
    const actions: Action[] = [];

    for (const card of init.deck.cards) {
      const action = createCard({
        name: card,
        player,
        zone: "deck",
      });

      state = gameSlice.reducer(state, action);
      actions.push(action);
    }

    players.forEach((player) => player.send(actions, "game/init"));
  }

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      const generator = doAction(playerAction, state);
      let actions: Action[] = [];
      let next = generator.next(state);
      while (!next.done) {
        state = gameSlice.reducer(state, next.value)
        actions.push(next.value);
        next = generator.next(state);
      }

      players.forEach((player) => player.send(actions, `game/${playerAction.type}Action`));
    } catch (e) {
      console.error(e);
    }
  }
}
