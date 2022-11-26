import { BitmapText, DisplayObjectProps, PixiElement } from "react-pixi-fiber";
import React from "react";
import PIXI, { IBitmapTextStyle } from "pixi.js";

export type TextProps = DisplayObjectProps<PIXI.BitmapText> & {
  style: Partial<IBitmapTextStyle>
};

export default function Text(props: TextProps) {
  if (!props.style.fontName) {
    props.style.fontName = "Oswald";
  }

  if (!props.style.fontSize) {
    props.style.fontSize = 100;
  }

  return <BitmapText {...props} y={(props.y ?? 0) - (props.style.fontSize / 2)} />;
}
