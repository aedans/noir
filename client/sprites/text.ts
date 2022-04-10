import { ITextStyle, Text, TextStyle } from "pixi.js";
import { interactive } from "../ui";

export function text(string: string, style: Partial<ITextStyle> | TextStyle = { fontSize: 20 }) {
  const text = new Text(string, {
    fontFamily: "Oswald",
    fill: 0xffffff,
    ...style
  });
  return text;
}

export function button(string: string, style: Partial<ITextStyle> | TextStyle = { fontSize: 20 }) {
  const sprite = text(string, style);
  interactive(sprite);
  return sprite;
}
