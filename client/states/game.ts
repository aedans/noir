import { Container, Graphics } from "pixi.js";
import { Socket } from "socket.io-client";
import { app } from "..";
import { CardState, choice, defaultPlayerState, getCardState, PlayerAction, PlayerState, StopMessage, Util } from "../../common/card";
import { arrayEquals } from "../../common/utils";
import { getCardInfo, util } from "../card";
import { cardHeight, cardSprite, cardWidth, displayColor } from "../sprites/card";
import { button, text } from "../sprites/text";
import { beginState } from "../state";
import { above, below, bottom, center, right, top, update, interactive, wrap, left, vertical } from "../ui";
import { menuState } from "./menu";

export async function gameState(name: string, socket: Socket) {
  beginState(`game/${name}`);

  const hand = new Graphics();
  hand.lineStyle(1, 0xffffff, 0);
  hand.drawRect(0, 0, 0, cardHeight());

  const board = new Graphics();
  board.lineStyle(1, 0xffffff, 0);
  board.drawRect(0, 0, 0, cardHeight());

  const opponentDeck = new Graphics();
  opponentDeck.lineStyle(1, 0xffffff, 0);
  opponentDeck.drawRect(0, 0, 0, cardHeight());

  const opponentBoard = new Graphics();
  opponentBoard.lineStyle(1, 0xffffff, 0);
  opponentBoard.drawRect(0, 0, 0, cardHeight());

  const history = new Graphics();
  history.lineStyle(1, 0xffffff, 0);
  history.drawRect(0, 0, app.screen.height / 2, cardWidth());

  const submit = button("");
  const money = button("");

  submit.on('pointerdown', () => onSubmit());

  let scroll = 0;
  window.addEventListener('wheel', (e) => {
    scroll -= e.deltaY;
    if (scroll > 0) scroll = 0;
    history.y = 5 + scroll;
  });

  app.stage.addChild(hand);
  app.stage.addChild(board);
  app.stage.addChild(opponentDeck);
  app.stage.addChild(opponentBoard);
  app.stage.addChild(history);
  app.stage.addChild(submit);
  app.stage.addChild(money);

  let player = defaultPlayerState();
  let opponent = defaultPlayerState();
  let actions: PlayerAction[] = [];
  let onSubmit = () => {};

  function roundScale(scale: number) {
    if (scale < 0.5) {
      return 0.5;
    } else {
      return scale;
    }
  }

  async function refresh(
    onHand: (card: CardState) => void, 
    onBoard: (card: CardState) => void,
    onOpponentDeck: (card: CardState) => void, 
    onOpponentBoard: (card: CardState) => void,
    onCard: (card: CardState, sprite: Container) => void,
  ) {
    money.text = "$" + player.money;

    const handSprites = await update(hand, async function*() {
      const scale = roundScale((app.screen.width - cardWidth() / 2) / (player.hand.length * (cardWidth() + 5)));
      for (const card of player.hand) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => onHand(card));
        onCard(card, sprite);
        yield sprite;
      }        
    });
    
    const boardSprites = await update(board, async function*() {
      const scale = roundScale((app.screen.width - cardWidth() / 2 - 2 * submit.width) / (player.board.length * (cardWidth() + 5)));
      for (const card of player.board) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => onBoard(card));
        onCard(card, sprite);
        yield sprite;
      }
    });

    const opponentDeckSprites = await update(opponentDeck, async function*() {
      const scale = roundScale((app.screen.width - cardWidth() / 2 - 2 * submit.width) / (opponent.deck.length * (cardWidth() + 5)));
      for (const card of opponent.deck) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => onOpponentDeck(card));
        onCard(card, sprite);
        yield sprite;
      }
    });

    const opponentBoardSprites = await update(opponentBoard, async function*() {
      const scale = roundScale((app.screen.width - cardWidth() / 2) / (opponent.board.length * (cardWidth() + 5)));
      for (const card of opponent.board) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => onOpponentBoard(card));
        onCard(card, sprite);
        yield sprite;
      }
    });

    const historySprites = await update(history, async function *() {
      for (const action of actions) {
        if (action.type == "end") {
          yield button("Turn End");
        } else if (action.type == "play" || action.type == "use") {
          const state = getCardState(action.card, player, opponent);
          if (state) {
            const colors = getCardInfo(state, player, opponent).colors(util, state, player, opponent);
            yield button(state.name, { fill: displayColor(colors) });
          } else {
            yield button("Hidden");
          }
        }
      }
    });

    wrap(handSprites, app.screen, 5);
    wrap(boardSprites, app.screen, 5);
    wrap(opponentDeckSprites, app.screen, 5);
    wrap(opponentBoardSprites, app.screen, 5);
    vertical(historySprites, 5);

    center(submit, app.screen);
    right(submit, app.screen);

    right(money, app.screen);
    below(submit, money);

    center(hand, app.screen);
    center(board, app.screen);
    center(opponentDeck, app.screen);
    center(opponentBoard, app.screen);

    bottom(hand, app.screen, 5);
    above(hand, board, 5);
    
    top(opponentDeck, 5);
    below(opponentDeck, opponentBoard, 5);

    top(history, 5 + scroll);
    left(history, 5);
  }

  function refreshDefault() {
    submit.text = player.turn ? "End Turn" : "Opponent's turn";
    onSubmit = () => socket.emit('action', { type: "end" });
    refresh(
      (card) => {
        const info = getCardInfo(card, player, opponent);
        choice(gameUtil, info.playChoice, info.cost(util, card, player, opponent), card, player, opponent, (choice) => {
          socket.emit('action', { type: "play", card: card.id, choice });
        });
      },
      (card) => {
        const info = getCardInfo(card, player, opponent);
        choice(gameUtil, info.useChoice, info.useCost(util, card, player, opponent), card, player, opponent, (choice) => {
          socket.emit('action', { type: "use", card: card.id, choice });
        });  
      },
      (card) => {},
      (card) => {},
      (card) => {},
    );
  }

  const gameUtil: Util = {
    ...util,
    chooseTargets(targets, number, upto, cc) {
      function refreshChoose() {
        if (upto && chosen.length != 0) {
          submit.text = "Select";
          onSubmit = () => cc(chosen);
        } else {
          submit.text = "Cancel";
          onSubmit = () => refreshDefault();
        }

        refresh(on, on, on, on, (card, sprite) => {
          if (chosen.includes(card.id)) {
            interactive(sprite, 1.0);
          } else if (targets.includes(card.id)) {
            interactive(sprite);
          } else {
            interactive(sprite, 0.4);
          }
        });
      }

      let chosen: string[] = [];
      const on = (card: CardState) => {
        if (targets.includes(card.id)) {
          if (chosen.includes(card.id)) {
            chosen = chosen.filter(c => c != card.id);
          } else {
            chosen.push(card.id);
          }

          refreshChoose();
          if (chosen.length == number || arrayEquals(targets.sort(), chosen.sort())) {
            cc(chosen);
          }
        }
      }

      refreshChoose();
    }
  }

  socket.on('state', (newPlayer: PlayerState, newOpponent: PlayerState, newActions: PlayerAction[]) => {
    player = newPlayer;
    opponent = newOpponent;
    actions = newActions;
    refreshDefault();
  });

  socket.on('stop', (stop: StopMessage) => {
    const message = button(`${stop.winner} wins`, { fontSize: 36 });
    center(message, app.screen);
    app.stage.addChild(message);

    message.on('pointerdown', () => {
      menuState();
    });
  });
}