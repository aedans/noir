import { Texture } from "pixi.js";
import React, { Ref } from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "../Rectangle";
import { GlowFilter } from "@pixi/filter-glow";
import { smallCardHeight, smallCardWidth } from "../Card";

export type ReticleProps = {
  x?: number;
  y?: number;
  isDragging: boolean;
  color: number;
};

const texture = Texture.from("reticle.png");

export default React.forwardRef(function Reticle(props: ReticleProps, ref: Ref<Container>) {
  const filter = new GlowFilter({
    color: props.color,
    quality: 1,
  });

  return (
    <>
      <Rectangle
        {...props}
        pivot={[smallCardWidth / 2, smallCardHeight / 2]}
        zIndex={100}
        width={smallCardWidth}
        height={smallCardHeight}
        ref={ref}
        fillAlpha={0.01}
        interactive
      >
        <Sprite
          pivot={[texture.width / 2, texture.height / 2]}
          x={smallCardWidth / 2}
          y={smallCardHeight / 2}
          width={200}
          height={200}
          texture={texture}
          alpha={props.isDragging ? 1 : 0}
          filters={[filter]}
        />
      </Rectangle>
    </>
  );
});
