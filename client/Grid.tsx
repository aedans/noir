import { Sprite } from "pixi.js";
import React, { createRef, MutableRefObject, Ref, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ReactElement } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { Target } from "../common/card";

export type GridProps<T extends Target> = Omit<PixiElement<Container>, "children"> & {
  data: T[];
  maxWidth?: number;
  margin?: { x: number; y: number };
  children: (t: T, ref: Ref<Container>, x: number, y: number, i: number) => ReactElement;
};

export default function Grid<T extends Target>(props: GridProps<T>) {
  const [value, setValue] = useState(0);
  const refs = useRef({}) as MutableRefObject<{
    [id: string]: MutableRefObject<Required<Container> & Partial<Sprite>>;
  }>;

  const margin = props.margin ?? { x: 1, y: 1 };

  let missingRefs = false;
  let elems: ReactElement[] = [];
  let x = 0;
  let y = 0;
  let i = 0;
  for (const child of props.data) {
    if (!refs.current[child.id]) {
      refs.current[child.id] = createRef() as MutableRefObject<Required<Container> & Partial<Sprite>>;
    }

    const ref = refs.current[child.id];
    elems.push(props.children(child, ref, x, y, i++));

    if (ref.current) {
      const container = ref.current;
      x += container.width * margin.x + margin.x;
      if (props.maxWidth != undefined && x > props.maxWidth) {
        x = 0;
        y += container.height * margin.y + margin.y;
      }
    } else {
      missingRefs = true;
    } 
  }

  useLayoutEffect(() => {
    if (missingRefs) {
      setValue(value + 1);
    }
  }, [props.data]);

  return <Container {...props}>{elems}</Container>;
}
