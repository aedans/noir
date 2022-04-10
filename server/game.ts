import { Socket } from "socket.io";
import { getCardInfo, util } from "./card";
import { isEqual } from "lodash";
import { CardCost, CardState, CardType, CardZone, defaultCardState, defaultPlayerState, Init, PlayerAction, PlayerState } from "../common/card";

function init(socket: Socket): Promise<Init> {
  return new Promise((resolve, reject) => {
    socket.on('init', (init) => {
      resolve(init);
    });
  });
}

function revealedPlayer(player: PlayerState): PlayerState {
  return {
    money: 0,
    hand: [],
    board: player.board.filter(x => x.revealed),
    deck: player.deck.filter(x => x.revealed),
    turn: player.turn
  }
}

function update(player: PlayerState, opponent: PlayerState) {
  player.hand = [];
  for (const state of player.deck) {
    if (playCard(state, player, opponent) != null) {
      player.hand.push(state);
    }
  }

  for (const zone of ["board", "deck", "hand"] as CardZone[]) {
    for (const card of player[zone]) {
      getCardInfo(card, player, opponent).update?.[zone]?.(util, card, player, opponent);
    }
  }
}

function turn(player: PlayerState, opponent: PlayerState) {
  opponent.turn = false;
  player.turn = true;

  for (const card of player.board) {
    card.used = false;
  }
  
  for (const zone of ["board", "deck", "hand"] as CardZone[]) {
    for (const card of player[zone]) {
      getCardInfo(card, player, opponent).turn?.[zone]?.(util, card, player, opponent);
    }
  }
}

function canBeOnBoard(type: CardType) {
  return type != "operation";
}

function playCard(state: CardState, player: PlayerState, opponent: PlayerState): (() => void) | null {
  const info = getCardInfo(state, player, opponent);
  const cost: CardCost = info.cost(util, state, player, opponent);
  const play = (info.play ?? (() => () => {}))(util, state, player, opponent);
  if (play == null) return null;
  if (player.money < cost.money) return null;
  return () => {
    play();
    
    player.money -= cost.money; 
    if (canBeOnBoard(info.type(util, state, player, opponent))) {
      player.board.push(state);
    }

    for (const zone of ["board", "deck", "hand"] as CardZone[]) {
      for (const card of player[zone]) {
        (getCardInfo(card, player, opponent).played?.[zone]?.(util, card, player, opponent) ?? (() => {}))(state);
      }

      for (const card of opponent[zone]) {
        (getCardInfo(card, opponent, player).played?.[zone]?.(util, card, opponent, player) ?? (() => {}))(state);
      }
    }

    update(player, opponent);
  };
}

function useCard(state: CardState, player: PlayerState, opponent: PlayerState): (() => void) | null {
  const info = getCardInfo(state, player, opponent);
  const cost: CardCost = (info.useCost ?? (() => ({ money: 0 })))(util, state, player, opponent);
  const use = (info.use ?? (() => () => {}))(util, state, player, opponent);
  if (use == null) return null;
  if (player.money < cost.money) return null;
  if (state.used) return null;
  return () => {
    use();
    player.money -= cost.money; 
    state.used = true;
    update(player, opponent);
  };
}

export async function startGame(socket1: Socket, socket2: Socket) {
  socket1.emit('start');
  socket2.emit('start');

  const init1Promise = init(socket1);
  const init2Promise = init(socket2);

  const player1 = defaultPlayerState();
  const player2 = defaultPlayerState();

  player1.deck = (await init1Promise).deck.map(defaultCardState);
  player2.deck = (await init2Promise).deck.map(defaultCardState);
  
  player1.turn = true;

  function doUpdate() {
    update(player1, player2);
    update(player2, player1);
  
    socket1.emit('state', player1, revealedPlayer(player2));
    socket2.emit('state', player2, revealedPlayer(player1));
  }

  function onAction(action: PlayerAction, number: number) {
    const player = number == 0 ? player1 : player2;
    const opponent = number == 0 ? player2 : player1;

    if (!player.turn) return;

    if (action.type == "end") {
      turn(opponent, player);
    } else if (action.type == "play") {
      const index = player.deck.findIndex(c => c.id == action.card);
      const card = player.deck[index];
      if (index >= 0) {
        player.deck.splice(index, 1);
        const play = playCard(card, player, opponent);
        if (play != null) {
          play();
        }
      }
    } else if (action.type == "use") {
      const index = player.board.findIndex(c => c.id == action.card);
      const card = player.deck[index];
      if (index >= 0) {
        const use = useCard(card, player, opponent);
        if (use != null) {
          use();
        }
      }
    }

    doUpdate();
  }

  doUpdate();

  socket1.on('action', (action: PlayerAction) => {
    onAction(action, 0);
  });

  socket2.on('action', (action: PlayerAction) => {
    onAction(action, 1);
  });
}