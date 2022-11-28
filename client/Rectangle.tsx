import {
  Container,
  CustomPIXIComponent,
  CustomPIXIComponentBehavior,
  DisplayObjectProps,
  PixiElement,
} from "react-pixi-fiber";
import * as PIXI from "pixi.js";
import React, { Ref } from "react";

export type RectangleProps = DisplayObjectProps<PIXI.Container> & {
  width: number;
  height: number;
  fill?: number;
};

export const behavior: CustomPIXIComponentBehavior<PIXI.Graphics, RectangleProps> = {
  customDisplayObject: (props) => new PIXI.Graphics(),
  customApplyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill ?? 0);
    instance.drawRect(x ?? 0, y ?? 0, width, height);
    instance.endFill();
  },
};

const CustomRectangle = CustomPIXIComponent(behavior, "Rectangle");

export default React.forwardRef(function Rectangle(props: RectangleProps, ref: Ref<Container>) {
  return (
    <Container {...props} ref={ref}>
      <CustomRectangle {...props} />
    </Container>
  );
});
