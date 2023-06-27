import { Container, PixiComponent } from "@pixi/react";
import { Graphics } from "./pixi.js";
import React, { ReactNode, Ref } from "react";

export type RectangleProps = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill?: number;
  fillAlpha?: number;
  children?: ReactNode;
};

const CustomRectangle = PixiComponent("Rectangle", {
  create(props) {
    return new Graphics();
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, fillAlpha, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill ?? 0, fillAlpha == undefined ? 1 : fillAlpha);
    instance.drawRect(0, 0, width, height);
    instance.endFill();
  },
});

export default React.forwardRef(function Rectangle(props: RectangleProps, ref: Ref<RectangleProps & Graphics>) {
  return (
    <Container {...props}>
      <CustomRectangle
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={props.fill}
        fillAlpha={props.fillAlpha}
        ref={ref}
      >
        {props.children}
      </CustomRectangle>
    </Container>
  );
});
