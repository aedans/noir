import { BitmapText, Bounds, Container, IBitmapTextStyle, Rectangle } from "pixi.js";
import { interactive } from "../ui";

class CustomBitmapText extends BitmapText {
  style: Partial<IBitmapTextStyle>;

  constructor(text: string, style?: Partial<IBitmapTextStyle>) {
    super(text, style);
    this.style = style;
  }

  get y(): number {
    return super.y + this.style.fontSize / 2;
  }

  set y(value: number) {
    super.y = value - this.style.fontSize / 2
  }
}

export function text(string: string, style: Partial<IBitmapTextStyle> = {}) {
  if (!style.fontSize) style.fontSize = 20;

  return new CustomBitmapText(string, {
    fontName: "Oswald",
    ...style
  });
}

export function button(string: string, style: Partial<IBitmapTextStyle> = {}) {
  const sprite = text(string, style);
  interactive(sprite);
  return sprite;
}
