import { Text } from "pixi.js";
import { interactive } from "../ui";

export function button(text: string) {
  const sprite = new Text(text, {
    fontSize: 16,
    fill: 0xffffff,
  });

  interactive(sprite);

  return sprite;
}
