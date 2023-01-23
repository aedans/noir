import React, { useMemo } from "react";
import { ReactElement } from "react";
import { CardState } from "../../common/card";
import { isCardStateEqual, smallCardHeight, smallCardWidth } from "../Card";

export type GridProps = {
  elements: CardState[];
  maxWidth?: number;
  children: (t: CardState, x: number, y: number, i: number) => ReactElement;
};

export function isGridPropsEqual(a: GridProps, b: GridProps) {
  if (a.elements.length != b.elements.length) {
    return false;
  }

  for (let i = 0; i < a.elements.length; i++) {
    if (!isCardStateEqual(a.elements[i], b.elements[i]) || a.elements[i].id != b.elements[i].id) {
      return false
    }
  }

  return a.maxWidth == b.maxWidth;
}

export default React.memo(function Grid(props: GridProps) {
  const elements = useMemo(() => {
    let elements: ReactElement[] = [];
    let x = 0;
    let y = 0;
    let i = 0;
    for (const child of props.elements) {
      elements.push(props.children(child, x, y, i++));

      x += smallCardWidth;
      if (props.maxWidth != undefined && x > props.maxWidth) {
        x = 0;
        y += smallCardHeight;
      }
    }
    return elements;
  }, [props.elements]);

  return <>{elements}</>;
}, isGridPropsEqual);
