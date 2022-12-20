import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import Text, { TextProps } from "./Text";
import { BitmapText, Container } from "react-pixi-fiber";
import anime from "animejs";

export type ButtonProps = TextProps;

export default React.forwardRef(function Button(props: ButtonProps, ref: Ref<Container>) {
  const textRef = useRef() as MutableRefObject<BitmapText>;

  useImperativeHandle(ref, () => textRef.current);

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
});
