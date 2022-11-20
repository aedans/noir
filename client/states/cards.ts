import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { Container3d } from "pixi-projection";
import { Graphics, Sprite } from "pixi.js";
import { cardNames, getCardInfo } from "../cards";
import { Deck, getDeck, updateDeck } from "../decks";
import { Entity, toEntity, entityContainer } from "../entity";
import { loadImage } from "../loader";
import { State } from "../state";
import { CustomBitmapText } from "../text";
import { animateTime, dragAndDroppable, lerp, targetResolution } from "../ui";
import { createPolaroidPicture, decksState } from "./decks";
import { folderState, FolderStateParams } from "./folder";

export const cardsState: State<FolderStateParams> = {
  name: "cards",
  scene: "folder",
  instantiate: async (params: FolderStateParams) => {
    const children: Entity[] = [];
    if (params.polaroid) children.push(params.polaroid);

    const deckParam = params.deck ?? getDeck("New Deck");
    const folderStateInstance = await folderState.instantiate();

    return {
      state: cardsState,
      previous: decksState,
      zones: folderStateInstance.zones,
      children: [...children, ...folderStateInstance.children],
      init: async () => {
        if (!params.polaroid) await createPolaroidPicture(deckParam, "polaroid", 0);

        let index = 0;
        for (const name of await cardNames) {
          await createCard(name, deckParam, "folder", index++);
        }

        index = 0;
        for (const name of deckParam.cards) {
          await createCard(name, deckParam, "deck", index++);
        }
      }
    }
  }
}

export async function createCard(name: string, deck: Deck, zone: string, index: number) {
  const cardSprite = toEntity(new SmoothGraphics());
  cardSprite.beginFill(0x000000, 1.0, true);
  cardSprite.drawRoundedRect(0, 0, (targetResolution.height - 20) / 4 * (1 / 1.4), (targetResolution.height - 20) / 4, 3);
  cardSprite.pivot.set(cardSprite.width / 2, cardSprite.height / 2);

  const costBox = toEntity(Sprite.from(await loadImage("paper.png")), false);
  costBox.anchor.set(.5, .5);
  costBox.width = cardSprite.width / 3;
  costBox.height = costBox.width;
  costBox.position.set(-cardSprite.width / 2 + costBox.width / 3, -cardSprite.height / 2 + costBox.height / 2.5);

  const nameText = new CustomBitmapText(name, {
    fontName: "Oswald",
    fontSize: 20,
    tint: 0xffffff,
    align: "right"
  });
  nameText.filters = [new DropShadowFilter({
    alpha: 1,
    distance: 3,
    blur: 0,
  })]
  nameText.anchor.set(.5, .5);
  nameText.position.set(cardSprite.width / 2 - nameText.width / 2 - 10, -cardSprite.height / 2 + 10);

  const textText = new CustomBitmapText((await getCardInfo(name)).text, {
    fontName: "Oswald",
    fontSize: 14,
    tint: 0xffffff,
    maxWidth: cardSprite.width - 10,
  });
  textText.filters = [new DropShadowFilter({
    alpha: 1,
    distance: 3,
    blur: 0,
  })]
  textText.anchor.set(.5, .5);
  textText.position.set(0, cardSprite.height * .33 - 10);

  const card = entityContainer(new Container3d());
  card.addChild(cardSprite, costBox, nameText, textText);
  card.interactive = true;
  card.x = targetResolution.width / 2;
  card.y = targetResolution.height / 2;

  dragAndDroppable(card, zone, index,
    {
      folder: () => {
        card.removeAllListeners();
        animateTime(10, (time) => card.alpha = lerp(1, 0, time)).then(() => card.visible = false);
        return -1;
      },
      deck: () => {
        deck.cards.push(name);
        updateDeck(deck);
        return deck.cards.lastIndexOf(name);
      }
    },
    {
      folder: () => {
        const position = card.position;
        createCard(name, deck, "folder", index).then(c => c.position.copyFrom(position));
        return false;
      },
      deck: () => {
        const index = deck.cards.indexOf(name);
        deck.cards = deck.cards.filter((n, i) => i != index);
        updateDeck(deck);
        return true;
      }
    },
    {
      deck: async () => "folder",
      folder: async () => "deck",
    },
    () => {});

  return card;
}