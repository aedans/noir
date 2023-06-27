import React, { useMemo } from "react";
import { ReactElement } from "react";
import { CardState } from "../../common/card.js";
import { cardHeight, cardWidth } from "../Card.js";
import { isEqual } from "../../common/util.js";

export type GridProps = {
  elements: CardState[];
  maxWidth?: number;
  children: (t: CardState, x: number, y: number, i: number) => ReactElement;
};

export function isGridPropsEqual(a: GridProps, b: GridProps) {
  return a.maxWidth == b.maxWidth && isEqual(a.elements, b.elements);
}

export default React.memo(function Grid(props: GridProps) {
  const elements = useMemo(() => {
    let elements: ReactElement[] = [];
    let x = 0;
    let y = 0;
    let i = 0;
    for (const child of props.elements) {
      elements.push(props.children(child, x, y, i++));

      x += cardWidth;
      if (props.maxWidth != undefined && x > props.maxWidth) {
        x = 0;
        y += cardHeight;
      }
    }
    return elements;
  }, [props.elements]);

  return <>{elements}</>;
}, isGridPropsEqual);
