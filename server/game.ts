import { Socket } from "socket.io";
import { getCardInfo, util } from "./card";
import { CardAction, CardCost, CardState, cardZones, defaultCardState, defaultPlayerState, StartMessage, PlayerAction, PlayerState, StopMessage, choice, CardColor, CardColors } from "../common/card";
import { v4 as uuidv4 } from 'uuid';

function start(socket: Socket): Promise<StartMessage> {
  return new Promise((resolve, reject) => {
    socket.on('start', (start: StartMessage) => {
      resolve(start);
    });
  });
}

function revealedPlayer(player: PlayerState): PlayerState {
  return {
    id: player.id, 
    money: 0,
    turn: player.turn,
    board: player.board.filter(x => x.revealed),
    deck: player.deck.filter(x => x.revealed),
    hand: player.hand.filter(x => x.revealed),
    graveyard: player.graveyard.filter(x => x.revealed),
  }
}

function update(player: PlayerState, opponent: PlayerState) {
  player.hand = [];
  for (const state of player.deck) {
    if (playCard(state, player, opponent) != null) {
      player.hand.push(state);
    }
  }

  for (const zone of cardZones) {
    for (const card of [...player[zone]]) {
      getCardInfo(card, player, opponent).update?.[zone]?.(util, card, player, opponent);
    }
  }
}

function turn(player: PlayerState, opponent: PlayerState) {
  opponent.turn = false;
  player.turn = true;

  for (const card of player.board) {
    card.activated = false;
  }

  for (const zone of cardZones) {
    for (const card of [...player[zone]]) {
      getCardInfo(card, player, opponent).turn?.[zone]?.(util, card, player, opponent);
    }
  }
}

function playCard(state: CardState, player: PlayerState, opponent: PlayerState): CardAction | null {
  const info = getCardInfo(state, player, opponent);
  const cost: CardCost = info.cost(util, state, player, opponent);
  const play = (info.play ?? (() => () => {}))(util, state, player, opponent);
  if (play == null) return null;
  if (player.money < cost.money) return null;
  if (choice(util, state, player, opponent, c => c) == null) return null;
  return (choice) => {
    if (info.type(util, state, player, opponent) == "operation") {
      state.revealed = true;
      player.graveyard.push(state);
    } else {
      player.board.push(state);
    }

    play(choice);
    
    player.money -= cost.money;
    if (cost.agents) {
      for (const color of Object.keys(cost.agents) as CardColors[]) {
        for (let i = 0; i < cost.agents![color]!; i++) {
          util.activate(choice.targets![color][i], player, opponent);
        }
      }
    }

    update(player, opponent);
  };
}

function useCard(state: CardState, player: PlayerState, opponent: PlayerState): CardAction | null {
  const info = getCardInfo(state, player, opponent);
  const cost: CardCost = (info.useCost ?? (() => ({ money: 0 })))(util, state, player, opponent);
  const use = (info.use ?? (() => () => {}))(util, state, player, opponent);
  if (use == null) return null;
  if (player.money < cost.money) return null;
  if (state.activated) return null;
  return (choice) => {
    util.activate(state.id, player, opponent);
    use(choice);
    player.money -= cost.money;
    update(player, opponent);
  };
}

function hasLost(player: PlayerState, opponent: PlayerState) { 
  return ![...player.deck, ...player.board].some(c => getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent");
}

export async function startGame(socket1: Socket, socket2: Socket) {
  socket1.emit('start');
  socket2.emit('start');

  const init1Promise = start(socket1);
  const init2Promise = start(socket2);

  const player1 = defaultPlayerState();
  const player2 = defaultPlayerState();

  player1.deck = (await init1Promise).deck.map(defaultCardState);
  player1.id = (await init1Promise).name;

  player2.deck = (await init2Promise).deck.map(defaultCardState);
  player2.id = (await init2Promise).name;

  if (player1.id == player2.id) {
    player1.id += ` [${uuidv4()}]`;
    player2.id += ` [${uuidv4()}]`;
  }
  
  player1.turn = true;

  const actions: PlayerAction[] = [];

  function doUpdate() {
    update(player1, player2);
    update(player2, player1);
  
    socket1.emit('state', player1, revealedPlayer(player2), actions);
    socket2.emit('state', player2, revealedPlayer(player1), actions);

    if (hasLost(player1, player2)) {
      const stop: StopMessage = { winner: player2.id };
      socket1.emit('stop', stop)
      socket2.emit('stop', stop)
    }

    if (hasLost(player2, player1)) {
      const stop: StopMessage = { winner: player1.id };
      socket1.emit('stop', stop);
      socket2.emit('stop', stop);
    }
  }

  function onAction(action: PlayerAction, number: number) {
    const player = number == 0 ? player1 : player2;
    const opponent = number == 0 ? player2 : player1;

    if (!player.turn) return;

    if (action.type == "end") {
      actions.push(action);
      turn(opponent, player);
    } else if (action.type == "play") {
      const index = player.deck.findIndex(c => c.id == action.card);
      const card = player.deck[index];
      if (index >= 0) {
        player.deck.splice(index, 1);
        const play = playCard(card, player, opponent);
        if (play != null) {
          actions.push(action);
          play(action.choice ?? {});
        }
      }
    } else if (action.type == "use") {
      const index = player.board.findIndex(c => c.id == action.card);
      const card = player.board[index];
      if (index >= 0) {
        const use = useCard(card, player, opponent);
        if (use != null) {
          actions.push(action);
          use(action.choice ?? {});
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