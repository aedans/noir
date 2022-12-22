import anime from "animejs";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import Text from "../Text";

export type MessageProps = {
  text: string;
};

export default function Message(props: MessageProps) {
  const ref = useRef() as MutableRefObject<Container>;

  if (ref.current) {
    ref.current.alpha = 1;
  }

  useEffect(() => {
    anime.remove(ref.current);
    anime({
      targets: ref.current,
      delay: 1500,
      duration: 250,
      easing: "linear",
      alpha: 0,
    });
  });

  return (
    <Text
      zIndex={1000}
      ref={ref}
      anchor={[0.5, 0.5]}
      text={props.text}
      x={targetResolution.width / 2}
      y={targetResolution.height / 2}
    />
  );
}
