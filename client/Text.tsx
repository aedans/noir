import { BitmapText } from "@pixi/react";
import React, { Ref } from "react";
import { BitmapText as PixiBitmapText, IBitmapTextStyle } from "./pixi.js";

export type TextProps = {
  anchor?: [number, number];
  x?: number;
  y?: number;
  text: string;
  style?: Partial<IBitmapTextStyle>;
};

export default React.forwardRef(function Text(props: TextProps, ref: Ref<PixiBitmapText>) {
  const style = props.style ?? {};

  if (!style.fontName) {
    style.fontName = "Oswald";
  }

  if (!style.fontSize) {
    style.fontSize = 100;
  }

  return (
    <BitmapText
      {...props}
      ref={ref}
      style={style}
      x={Math.floor(props.x ?? 0)}
      y={Math.floor((props.y ?? 0) - style.fontSize / 2)}
    />
  );
});
