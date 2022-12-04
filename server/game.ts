import Player, { PlayerAction } from "./Player";
import { createCard, endTurn, gameSlice, GameState, initialState, moveCard, zones } from "../common/gameSlice";
import { getCardInfo } from "./card";
import { currentPlayer } from "../common/util";
import { v4 as uuidv4 } from "uuid";
import { AnyAction } from "redux";

function* beginTurn(game: GameState) {
  const player = currentPlayer(game);

  for (const zone of zones) {
    for (const card of game.players[player][zone]) {
      yield* getCardInfo(game, card).turn();
    }
  }
}

function* playCard(id: string, game: GameState) {
  const player = currentPlayer(game);
  const card = game.players[player].deck.find((c) => c.id == id);
  if (!card) {
    throw `Card ${id} is not in deck`;
  }

  const info = getCardInfo(game, card);
  yield* info.play();
  if (info.type == "operation") {
    yield moveCard({
      id: id,
      from: { player, zone: "deck" },
      to: { player, zone: "graveyard" },
    });
  } else {
    yield moveCard({
      id: id,
      from: { player, zone: "deck" },
      to: { player, zone: "board" },
    });
  }
}

function* doAction(action: PlayerAction, game: GameState) {
  if (action.type == "end") {
    yield endTurn();
    yield* beginTurn(game);
  } else if (action.type == "play") {
    yield* playCard(action.id, game);
  }
}

export async function createGame(players: [Player, Player]) {
  let state = initialState;

  for (const player of [0, 1] as const) {
    const init = await players[player].init();
    const actions: AnyAction[] = [];

    for (const card of init.deck.cards) {
      const action = createCard({
        id: uuidv4(),
        name: card,
        player,
        zone: "deck",
      });

      state = gameSlice.reducer(state, action);
      actions.push(action);
    }

    players.forEach((player) => player.send(actions));
  }

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      const actions = [...doAction(playerAction, state)];
      for (const action of actions) {
        state = gameSlice.reducer(state, action);
      }
      
      players.forEach((player) => player.send(actions));
    } catch (e) {
      console.error(e);
    }
  }
}
