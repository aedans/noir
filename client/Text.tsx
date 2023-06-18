import { BitmapText, DisplayObjectProps } from "react-pixi-fiber";
import React, { Ref } from "react";
import { IBitmapTextStyle } from "pixi.js";

export type TextProps = DisplayObjectProps<BitmapText> & {
  text: string;
  style?: Partial<IBitmapTextStyle>;
};

export default React.forwardRef(function Text(props: TextProps, ref: Ref<BitmapText>) {
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
      fontName={style.fontName}
      fontSize={style.fontSize}
      tint={style.tint}
      align={style.align}
      letterSpacing={style.letterSpacing}
      maxWidth={style.maxWidth}
      x={Math.floor(props.x)}
      y={Math.floor((props.y ?? 0) - style.fontSize / 2)}
    />
  );
});
