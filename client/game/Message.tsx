import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import anime from "animejs";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { targetResolution } from "../Camera.js";
import Text from "../Text.js";
import { BitmapText } from "../pixi.js";
import { Container } from "@pixi/react";

export type MessageProps = {
  text: string;
};

export default React.memo(function Message(props: MessageProps) {
  const ref = useRef() as MutableRefObject<BitmapText>;

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

  const dropShadowFilter = new DropShadowFilter({
    alpha: 1,
    blur: 0,
    distance: 10,
  });

  return (
    <Container zIndex={1000} filters={[dropShadowFilter]}>
      <Text
        ref={ref}
        anchor={[0.5, 0.5]}
        text={props.text}
        style={{ fontSize: 150 }}
        x={targetResolution.width / 2}
        y={targetResolution.height / 2}
      />
    </Container>
  );
});
