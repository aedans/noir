import { ITextStyle, Text, TextStyle } from "pixi.js";
import { interactive } from "../ui";

export function text(string: string, style: Partial<ITextStyle> | TextStyle = {}) {
  const text = new Text(string, {
    fontFamily: "Oswald",
    fill: 0xffffff,
    fontSize: 20,
    ...style
  });
  return text;
}

export function button(string: string, style: Partial<ITextStyle> | TextStyle = {}) {
  const sprite = text(string, style);
  interactive(sprite);
  return sprite;
}
