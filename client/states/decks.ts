import { Container3d } from "pixi-projection";
import { Deck, getDeck, getDeckNames } from "../decks";
import { toEntity, entityContainer, Entity } from "../entity";
import { folderState, FolderStateParams } from "./folder";
import { enterState, State } from "../state";
import { CustomBitmapText } from "../text";
import { dragAndDroppable, targetResolution } from "../ui";
import { cardsState } from "./cards";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { mainState } from "./main";

export const decksState: State<FolderStateParams> = {
  name: "decks",
  scene: "folder",
  instantiate: async (params: FolderStateParams) => {
    const children: Entity[] = [];
    if (params.polaroid) children.push(params.polaroid);

    const folderStateInstance = await folderState.instantiate();

    return {
      state: decksState,
      previous: mainState,
      zones: folderStateInstance.zones,
      children: [...children, ...folderStateInstance.children],
      background: folderStateInstance,
      init: async () => {
        let index = 0;
        for (const name of getDeckNames().filter(n => n != params.deck?.name)) {
          await createPolaroidPicture(getDeck(name), "folder", index++);
        }
      }
    }
  }
}

export async function createPolaroidPicture(deck: Deck, zone: string, index: number) {
  const polaroidSprite = toEntity(new SmoothGraphics());
  polaroidSprite.beginFill(0xffffff, 1.0, true);
  polaroidSprite.drawRoundedRect(0, 0, (targetResolution.height - 20) / 4 * (1 / 1.4), (targetResolution.height - 20) / 4, 3);
  polaroidSprite.pivot.set(polaroidSprite.width / 2, polaroidSprite.height / 2);

  // const iconSource = deck.icon == "" ? "images/Flashy Tenner.png" : "images/" + deck.icon + ".png"
  // const imageSprite = toEntity(Sprite.from(await loadImage(iconSource)), false);
  // imageSprite.anchor.set(.5, .5);
  // imageSprite.scale.set((polaroidSprite.width - 20) / imageSprite.width)
  // imageSprite.position.set(0, -polaroidSprite.height / 2 + imageSprite.height / 2 + 10);

  const text = new CustomBitmapText(deck.name, {
    fontName: "Oswald",
    fontSize: 28,
    tint: 0,
  });
  text.anchor.set(.5, .5);
  text.position.set(0, polaroidSprite.height / 2 - text.height - 5);

  const polaroid = entityContainer(new Container3d());
  polaroid.addChild(polaroidSprite, text);
  polaroid.interactive = true;
  polaroid.x = targetResolution.width / 2;
  polaroid.y = targetResolution.height / 2;

  dragAndDroppable(polaroid, zone, index,
    {
      deck: (doExit, doEnter) => {
        doEnter("polaroid");
        return -1;
      },
      folder: (doExit, doEnter) => {
        return getDeckNames().indexOf(deck.name);
      }
    },
    {

    },
    {
      polaroid: async () => {
        await enterState(decksState, { deck, polaroid });
        return "folder";
      },
      folder: async () => {
        enterState(cardsState, { deck, polaroid });
        return "polaroid";
      }
    },
    () => {});

  return polaroid;
}