import React, { useRef } from "react";
import { ReactElement } from "react";
import { CardState } from "../../common/card";
import { smallCardHeight, smallCardWidth } from "../Card";

export type GridProps = {
  elements: CardState[];
  maxWidth?: number;
  margin?: { x: number; y: number };
  children: (t: CardState, x: number, y: number, i: number) => ReactElement;
};

export default React.memo(function Grid(props: GridProps) {
  const margin = props.margin ?? { x: 1, y: 1 };
  const children = useRef({} as { [id: string]: ReactElement });

  let elements: ReactElement[] = [];
  let x = 0;
  let y = 0;
  let i = 0;
  for (const child of props.elements) {
    if (!children.current[child.id]) {
      children.current[child.id] = props.children(child, x, y, i++);
    }

    elements.push(children.current[child.id]);

    x += smallCardWidth * margin.x + margin.x;
    if (props.maxWidth != undefined && x > props.maxWidth) {
      x = 0;
      y += smallCardHeight * margin.y + margin.y;
    }
  }

  return <>{elements}</>;
});
