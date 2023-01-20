import { Rectangle, Texture } from "pixi.js";
import React, { Ref } from "react";
import { PixiElement, Sprite } from "react-pixi-fiber";
import { GlowFilter } from "@pixi/filter-glow";
import { cardHeight, cardWidth, smallCardHeight, smallCardScale, smallCardWidth } from "../Card";
import Rect from "../Rectangle"

export type ReticleProps = PixiElement<Sprite> & {
  x?: number;
  y?: number;
  isDragging: boolean;
  color: number;
};

const texture = Texture.from("/reticle.png");

export default React.forwardRef(function Reticle(props: ReticleProps, ref: Ref<Sprite>) {
  const filter = new GlowFilter({
    color: props.color,
    quality: 1,
  });

  return (
    <Sprite
      {...props}
      pivot={[texture.width / 2, texture.height / 2]}
      width={200}
      height={200}
      texture={texture}
      alpha={props.isDragging ? 1 : 0.001}
      filters={[filter]}
      zIndex={1000}
      hitArea={new Rectangle(-smallCardWidth - texture.width / 4, -smallCardHeight - texture.height / 2, cardWidth, cardHeight)}
      interactive
      ref={ref}
    />
  );
});
