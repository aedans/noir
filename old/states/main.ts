import { Container, Sprite } from "pixi.js";
import { animateTime, lerp, targetResolution } from "../ui";
import { enterState, State } from "../state";
import { decksState } from "./decks";
import { CustomBitmapText } from "../text";
import { entityContainer, toEntity } from "../entity";
import { loadImage } from "../loader";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export const mainState: State = {
  name: "main",
  scene: "lamp",
  instantiate: async () => {
    const lamp = await createLamp();
    const queueButton = createButton("Queue", 400, () => enterState(decksState, {}));
    const decksButton = createButton("Decks", 550, () => enterState(decksState, {}));
 
    return {
      state: mainState,
      children: [lamp, queueButton, decksButton],
    }
  },
}

async function createLamp() {
  const lamp = toEntity(Sprite.from(await loadImage("lamp.png")));
  lamp.anchor.set(.5, 0);
  lamp.width = 200;
  lamp.height = 200;

  const light = toEntity(new SmoothGraphics());
  light.beginFill(0x767676, 1.0, true);
  light.drawPolygon(
    -94, 114,
    -800, targetResolution.height * 1.5,
    800, targetResolution.height * 1.5,
    92, 100
  );

  const container = entityContainer(new Container());
  container.addChild(light, lamp);
  container.x = targetResolution.width / 2;
  container.y = 0;
  container.pivot.set(0, 0);
  
  return Object.assign(container, {
    update: (time: number) => {
      container.rotation = Math.sin(time / 50) / 10;
    }
  });
}

function createButton(text: string, y: number, click: () => void) {
  const button = toEntity(new CustomBitmapText(text, {
    fontName: "Oswald",
    fontSize: 74,
  }), true);
  button.x = targetResolution.width / 2;
  button.y = y;
  button.anchor.set(0.5, 0.5);
  button.interactive = true;
  button.setHover(2);

  button.on('mouseover', () => animateTime(5, (t) => button.scale.set(lerp(button.scale.x, 1.25, t))));
  button.on('mouseout', () => animateTime(5, (t) => button.scale.set(lerp(button.scale.x, 1.0, t))));
  button.on('pointerdown', () => click());

  return button;
}