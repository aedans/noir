import React, { MutableRefObject } from "react";
import Text, { TextProps } from "./Text";
import { BitmapText } from "react-pixi-fiber";
import anime from "animejs";

export type ButtonProps = TextProps;

export default function Button(props: ButtonProps) {
  const ref = React.useRef() as MutableRefObject<BitmapText>;

  return (
    <Text
      {...props}
      ref={ref}
      anchor={{ x: 0.5, y: 0.5 }}
      interactive
      mouseover={() => {
        anime({
          targets: ref.current.scale,
          duration: 100,
          easing: "linear",
          x: 1.25,
          y: 1.25,
        });
      }}
      mouseout={() => {
        anime({
          targets: ref.current.scale,
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
