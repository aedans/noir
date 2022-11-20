import { BitmapText, IBitmapTextStyle } from "pixi.js";

export class CustomBitmapText extends BitmapText {
  style: Partial<IBitmapTextStyle>;

  constructor(text: string, style: Partial<IBitmapTextStyle>) {
    super(text, style);
    this.style = style;
  }

  get y(): number {
    return super.y + (this.style?.fontSize ?? 20) / 2;
  }

  set y(value: number) {
    super.y = value - (this.style?.fontSize ?? 20) / 2
  }
}