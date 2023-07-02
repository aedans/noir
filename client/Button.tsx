import React, { MutableRefObject, useEffect, useRef } from "react";
import { Container } from "@pixi/react";
import Text, { TextProps } from "./Text.js";
import anime from "animejs";
import { BitmapText, Rectangle } from "./pixi.js";

export type ButtonProps = TextProps & {
  pointerdown?: () => void;
};

export default function Button(props: ButtonProps) {
  const textRef = useRef() as MutableRefObject<BitmapText>;

  useEffect(() => {
    const { width } = textRef.current;
    textRef.current.hitArea = new Rectangle(-width / 2, 0, width, 85);
  }, [props]);

  return (
    <Container
      interactive
      pointerdown={props.pointerdown}
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
      <Text {...props} anchor={[0.5, 0.5]} ref={textRef} />
    </Container>
  );
}
