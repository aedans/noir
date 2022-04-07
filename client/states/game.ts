import { Graphics } from "pixi.js";
import { Socket } from "socket.io-client";
import { app } from "..";
import { PlayerState } from "../../common/card";
import { cardSprite, cardWidth } from "../sprites/card";
import { button as text } from "../sprites/text";
import { beginState } from "../state";
import { above, below, bottom, center, right, top, update, horizontal } from "../ui";

export async function gameState(name: string, socket: Socket) {
  beginState(`game/${name}`);

  const hand = new Graphics();
  hand.lineStyle(1, 0xffffff, 0);
  hand.drawRect(0, 0, 0, (app.screen.height - 15) / 4);

  const board = new Graphics();
  board.lineStyle(1, 0xffffff, 0);
  board.drawRect(0, 0, 0, (app.screen.height - 15) / 4);

  const opponentDeck = new Graphics();
  opponentDeck.lineStyle(1, 0xffffff, 0);
  opponentDeck.drawRect(0, 0, 0, (app.screen.height - 15) / 4);

  const opponentBoard = new Graphics();
  opponentBoard.lineStyle(1, 0xffffff, 0);
  opponentBoard.drawRect(0, 0, 0, (app.screen.height - 15) / 4);

  const end = text("")
  const money = text("")

  end.on('pointerdown', () => {
    socket.emit('action', { type: "end" });
  });

  app.stage.addChild(hand);
  app.stage.addChild(board);
  app.stage.addChild(opponentDeck);
  app.stage.addChild(opponentBoard);
  app.stage.addChild(end);
  app.stage.addChild(money);

  socket.on('state', async (player: PlayerState, opponent: PlayerState) => {
    money.text = "$" + player.money;
    end.text = player.turn ? "End Turn" : "Opponent's turn";

    const handSprites = await update(hand, async function*() {
      const scale = (app.screen.width - cardWidth() / 2) / (player.hand.length * (cardWidth() + 5));
      for (const card of player.hand) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => {
          socket.emit('action', { type: "play", card });
        });
  
        yield sprite;
      }        
    });
    
    const boardSprites = await update(board, async function*() {
      const scale = (app.screen.width - cardWidth() / 2 - 2 * end.width) / (player.board.length * (cardWidth() + 5));
      for (const card of player.board) {
        const sprite = await cardSprite(card, player, opponent, scale);
        sprite.on('pointerdown', () => {
          socket.emit('action', { type: "use", card });
        });

        yield sprite;
      }
    });

    const opponentDeckSprites = await update(opponentDeck, async function*() {
      const scale = (app.screen.width - cardWidth() / 2 - 2 * end.width) / (opponent.deck.length * (cardWidth() + 5));
      for (const card of opponent.deck) {
        yield await cardSprite(card, player, opponent, scale);
      }
    });

    const opponentBoardSprites = await update(opponentBoard, async function*() {
      const scale = (app.screen.width - cardWidth() / 2) / (opponent.board.length * (cardWidth() + 5));
      for (const card of opponent.board) {
        yield await cardSprite(card, player, opponent, scale);
      }
    });

    horizontal(handSprites, 5);
    horizontal(boardSprites, 5);
    horizontal(opponentDeckSprites, 5);
    horizontal(opponentBoardSprites, 5);

    center(end, app.screen);
    right(end, app.screen);

    right(money, app.screen);
    below(end, money);

    center(hand, app.screen);
    center(board, app.screen);
    center(opponentDeck, app.screen);
    center(opponentBoard, app.screen);

    bottom(hand, app.screen);
    above(hand, board, 5);
    
    top(opponentDeck);
    below(opponentDeck, opponentBoard, 5);
  });
}