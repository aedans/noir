import { Texture } from "pixi.js";
import React, { Ref } from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "../Rectangle";
import { gameCardHeight, gameCardWidth } from "./GameCard";
import { GlowFilter } from "@pixi/filter-glow";

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
        pivot={[gameCardWidth / 2, gameCardHeight / 2]}
        zIndex={100}
        width={gameCardWidth}
        height={gameCardHeight}
        ref={ref}
        fillAlpha={0.01}
        interactive
      >
        <Sprite
          pivot={[texture.width / 2, texture.height / 2]}
          x={gameCardWidth / 2}
          y={gameCardHeight / 2}
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
