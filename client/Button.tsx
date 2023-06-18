import React, { MutableRefObject, useRef } from "react";
import Text, { TextProps } from "./Text";
import { BitmapText } from "react-pixi-fiber";
import anime from "animejs";

export type ButtonProps = TextProps;

export default function Button(props: ButtonProps) {
  const textRef = useRef() as MutableRefObject<BitmapText>;

  return (
    <Text
      {...props}
      ref={textRef}
      anchor={[0.5, 0.5]}
      interactive
      mouseover={() => {
        anime({
          targets: textRef.current.scale,
          duration: 100,
          easing: "linear",
          x: 1.25,
          y: 1.25,
        });
      }}
      mouseout={() => {
        anime({
          targets: textRef.current.scale,
          duration: 100,
          easing: "linear",
          x: 1,
          y: 1,
        });
      }}
    >
      {props.children}
    </Text>
  );
}
