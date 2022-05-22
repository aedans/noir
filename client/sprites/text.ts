import { BitmapText, Container, IBitmapTextStyle } from "pixi.js";
import { interactive } from "../ui";

export function text(string: string, style: Partial<IBitmapTextStyle> = {}) {
  if (!style.fontSize) style.fontSize = 20;

  const text = new BitmapText(string, {
    fontName: "Oswald",
    ...style
  });
  
  text.y -= style.fontSize / 2;

  const container = new Container()
  container.addChild(text)
  return container;
}

export function button(string: string, style: Partial<IBitmapTextStyle> = {}) {
  const sprite = text(string, style);
  interactive(sprite);
  return sprite;
}
