import Player, { PlayerAction } from "./Player";
import { currentPlayer, endTurn, gameSlice, GameState, initialState, moveCard } from "../common/gameSlice";
import { getCardInfo } from "./card";

function* playCard(id: string, game: GameState) {
  const player = currentPlayer(game);
  const card = game.players[player].hand.find(c => c.id == id);
  if (!card) {
    throw `Card ${id} is not in hand`;
  }

  const info = getCardInfo(card, game);
  if (info.type == "operation") {
    yield moveCard({
      id: id,
      from: { player, zone: "hand" },
      to: { player, zone: "graveyard" },
    });  
  } else {
    yield moveCard({
      id: id,
      from: { player, zone: "hand" },
      to: { player, zone: "board" },
    });  
  }
}

function* doAction(action: PlayerAction, game: GameState) {
  if (action.type == "end") {
    yield endTurn();
  } else if (action.type == "play") {
    yield* playCard(action.id, game);
  }
}

export async function createGame(players: [Player, Player]) {
  let state = initialState;

  while (true) {
    const player = currentPlayer(state);
    const playerAction = await players[player].receive();

    try {
      for (const action of doAction(playerAction, state)) {
        state = gameSlice.reducer(state, action);
        players.forEach((player) => player.send(action));
      }
    } catch (e) {
      console.error(e);
    }
  }
}
