import { BitmapText, IBitmapTextStyle } from "pixi.js";

export default class TextEntity extends BitmapText {
  style: Partial<IBitmapTextStyle>;

  constructor(text: string, style: Partial<IBitmapTextStyle>, options?: Partial<TextEntity>) {
    super(text, style);
    this.style = style;

    Object.assign(this, options);
  }

  get y(): number {
    return super.y + (this.style?.fontSize ?? 20) / 2;
  }

  set y(value: number) {
    super.y = value - (this.style?.fontSize ?? 20) / 2;
  }
}
