import { Container, Graphics, Text } from "pixi.js";
import { CardState, PlayerState } from "../../common/card";
import { app } from "..";
import { top, left, right, bottom, interactive } from "../ui";
import { loadCardInfo, util } from "../card";

const colorMap = {
  orange: 0xEB7900,
  blue: 0x00ACEB,
  green: 0x83EB00,
  purple: 0xCD00EB,
}

export function cardHeight() {
  return (app.screen.height - 15) / 4;
}

export function cardWidth() {
  return cardHeight() * (1 / 1.4)
}

export async function cardSprite(card: CardState, player: PlayerState, opponent: PlayerState, scale: number = 1) {
  if (scale > 1) scale = 1;
  
  const height = scale * cardHeight();
  const width = scale * cardWidth();

  const sprite = new Container();
  interactive(sprite);

  const cardInfo = await loadCardInfo(card, player, opponent);
  const colors = cardInfo.colors(util, card, player, opponent);
  const borderColor = colors.length == 1 ? colorMap[colors[0]] : 0xEBEBEB;

  const border = new Graphics();
  border.beginFill(0x000000, 1);
  border.drawRect(0, 0, width, height);
  border.lineStyle(1, borderColor);
  border.drawRect(0, 0, width, height);

  const nameText = new Text(card.name, {
    fontSize: 14 * scale,
    fill: 0xffffff,
  });

  const moneyText = new Text((cardInfo.cost(util, card, player, opponent).money ?? "") + "", {
    fontSize: 14 * scale,
    fill: 0xffffff,
  });

  const textText = new Text(cardInfo.text(util, card, player, opponent), {
    fontSize: 12 * scale,
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: width - 10,
  });

  sprite.addChild(border);
  sprite.addChild(nameText);
  sprite.addChild(moneyText);
  sprite.addChild(textText);

  top(nameText, 5);
  left(nameText, 5);

  top(moneyText, 5)
  right(moneyText, sprite, 5);

  left(textText, 5)
  bottom(textText, sprite, 5);

  return sprite;
}