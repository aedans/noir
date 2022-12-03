import React, { MutableRefObject } from "react";
import Text, { TextProps } from "./Text";
import gsap from "gsap";
import { BitmapText } from "react-pixi-fiber";

export type ButtonProps = TextProps & {
  onClick: () => void;
};

export default function Button(props: ButtonProps) {
  const ref = React.useRef() as MutableRefObject<BitmapText>;

  return (
    <Text
      {...props}
      ref={ref}
      anchor={{ x: 0.5, y: 0.5 }}
      interactive
      pointerdown={props.onClick}
      mouseover={() => {
        gsap.to(ref.current.scale, {
          duration: 0.1,
          x: 1.25,
          y: 1.25,
        });
      }}
      mouseout={() => {
        gsap.to(ref.current.scale, {
          duration: 0.1,
          x: 1,
          y: 1,
        });
      }}
    >
      {props.children}
    </Text>
  );
}
