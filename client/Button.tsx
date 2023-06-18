import React, { MutableRefObject, useEffect, useRef } from "react";
import Text, { TextProps } from "./Text";
import { Container } from "react-pixi-fiber";
import anime from "animejs";
import { Graphics, Rectangle } from "pixi.js";

export type ButtonProps = TextProps;

export default function Button(props: ButtonProps) {
  const textRef = useRef() as MutableRefObject<Required<Container>>;

  useEffect(() => {
    const { width } = textRef.current;
    textRef.current.hitArea = new Rectangle(-width / 2, 0, width, 85);
  }, [props]);

  return (
    <Text
      {...props}
      ref={textRef}
      anchor={[0.5, 0.5]}
      interactive
      mouseover={() => {
        anime({
          targets: textRef.current.transform.scale,
          duration: 100,
          easing: "linear",
          x: 1.25,
          y: 1.25,
        });
      }}
      mouseout={() => {
        anime({
          targets: textRef.current.transform.scale,
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
