import React, { useMemo } from "react";
import { ReactElement } from "react";
import { CardState } from "../../common/card.js";
import { cardHeight, cardWidth, isCardStateEqual } from "../Card.js";

export type GridProps = {
  elements: CardState[];
  maxWidth?: number;
  card: (t: CardState, x: number, y: number, i: number) => ReactElement;
};

export function isGridPropsEqual(a: GridProps, b: GridProps) {
  return (
    a.maxWidth == b.maxWidth &&
    a.card == b.card &&
    a.elements.length == b.elements.length &&
    a.elements.every((_, index) => isCardStateEqual(a.elements[index], b.elements[index]))
  );
}

export default React.memo(function Grid(props: GridProps) {
  const elements = useMemo(() => {
    let elements: ReactElement[] = [];
    let x = 0;
    let y = 0;
    let i = 0;
    for (const child of props.elements) {
      elements.push(props.card(child, x, y, i++));

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
