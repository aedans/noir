import { Container, CustomPIXIComponent, CustomPIXIComponentBehavior, DisplayObjectProps, PixiElement } from "react-pixi-fiber";
import * as PIXI from "pixi.js";
import React from "react";

export type RectangleProps = DisplayObjectProps<PIXI.Container> & { innerRef?: PixiElement<Container>["ref"] } & {
  width: number;
  height: number;
  fill: number;
};

export const behavior: CustomPIXIComponentBehavior<PIXI.Graphics, RectangleProps> = {
  customDisplayObject: (props) => new PIXI.Graphics(),
  customApplyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill);
    instance.drawRect(x ?? 0, y ?? 0, width, height);
    instance.endFill();
  },
};

const CustomRectangle = CustomPIXIComponent(behavior, "Rectangle");

export default function Rectangle(props: RectangleProps) {
  return (
    <Container {...props} ref={props.innerRef}>
      <CustomRectangle {...props}></CustomRectangle>
    </Container>
  );
}
