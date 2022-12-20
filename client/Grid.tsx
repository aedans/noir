import { Sprite } from "pixi.js";
import React, { createRef, MutableRefObject, useLayoutEffect } from "react";
import { ReactElement } from "react";
import { Container, PixiElement } from "react-pixi-fiber";

export type GridProps<T> = Omit<PixiElement<Container>, "children"> & {
  data: T[];
  maxWidth?: number;
  margin?: { x: number; y: number };
  children: (t: T, ref: MutableRefObject<Required<Container>>) => ReactElement;
};

export default function Grid<T>(props: GridProps<T>) {
  const children = props.data.map((d) => {
    const ref = createRef() as MutableRefObject<Required<Container> & Partial<Sprite>>;
    return { element: props.children(d, ref), ref };
  });

  const margin = props.margin ?? { x: 1, y: 1 };

  useLayoutEffect(() => {
    let x = 0;
    let y = 0;
    for (const container of children.map((c) => c.ref.current)) {
      container.x = x;
      container.y = y;

      if (container.anchor) {
        container.x += container.width * container.anchor.x;
        container.y += container.height * container.anchor.y;
      }

      if (container.pivot) {
        container.x += container.pivot.x * container.scale.x;
        container.y += container.pivot.y * container.scale.y;
      }

      x += container.width * margin.x + margin.x;
      if (props.maxWidth != undefined && x > props.maxWidth) {
        x = 0;
        y += container.height * margin.y + margin.y;
      }
    }
  }, [props.data]);

  return <Container {...props}>{children.map((c) => c.element)}</Container>;
}
