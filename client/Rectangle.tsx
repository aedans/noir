import { Container, CustomPIXIComponent, CustomPIXIComponentBehavior, Graphics, PixiElement } from "react-pixi-fiber";
import * as PIXI from "pixi.js";
import React, { Ref } from "react";

export type RectangleProps = PixiElement<Container> & {
  width: number;
  height: number;
  fill?: number;
  fillAlpha?: number;
  zIndex?: number;
};

export const behavior: CustomPIXIComponentBehavior<PIXI.Graphics, RectangleProps> = {
  customDisplayObject: (props) => new PIXI.Graphics(),
  customApplyProps: (instance, oldProps, newProps) => {
    const { fill, fillAlpha, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill ?? 0, fillAlpha == undefined ? 1 : fillAlpha);
    instance.drawRect(0, 0, width, height);
    instance.endFill();
    instance.zIndex = newProps.zIndex ?? 0;
  },
};

const CustomRectangle = CustomPIXIComponent(behavior, "Rectangle");

export default React.forwardRef(function Rectangle(
  props: PixiElement<Container> & RectangleProps,
  ref: Ref<RectangleProps & Graphics>
) {
  return (
    <Container {...props}>
      <CustomRectangle
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={props.fill}
        fillAlpha={props.fillAlpha}
        zIndex={props.zIndex}
        ref={ref}
      >
        {props.children}
      </CustomRectangle>
    </Container>
  );
});
