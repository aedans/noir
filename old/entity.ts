import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { Container, DisplayObject } from "pixi.js";
import { light } from "./state";

export type Entity = DisplayObject & {
  relight: (source: { x: number, y: number }) => void,
  setHover: (depth: number) => void,
  update?: (time: number) => void,
  currentAnimation?: Promise<void>
}

export function dropShadow() {
  const filter = new DropShadowFilter({
    alpha: 1
  });
  filter.enabled = false;
  return Object.assign(filter, {
    depth: 0,
    relight: function (object: DisplayObject, source: { x: number, y: number }) {
      const x = object.getGlobalPosition().x - source.x;
      const y = object.getGlobalPosition().y - source.y;
      filter.rotation = Math.atan2(y, x) * (180 / Math.PI);
      filter.enabled = this.depth > 0;
      filter.distance = Math.ceil(this.depth * (Math.sqrt(x*x + y*y) / 100));
      filter.blur = Math.ceil(filter.distance / 50);
    }
  });
}

export function entityContainer<A extends Container>(container: A, shadow: boolean = true): Entity & A {
  const filter = dropShadow();
  container.filters = [filter];
  return Object.assign(container, {
    relight: (source: { x: number, y: number }) => {
      if (shadow) filter.relight(container, source);
      for (const child of container.children) {
        (child as Entity).relight?.(source);
      }
    },
    setHover: (d: number) => {
      filter.depth = d;
      for (const child of container.children) {
        (child as Entity).setHover?.(d);
      }
    },
    update: (time: number) => {
      for (const child of container.children) {
        (child as Entity).update?.(time);
      }
    }
  })
}

export function toEntity<A extends DisplayObject & { tint: number }>(sprite: A, shadow: boolean = false): Entity & A {
  const filter = dropShadow();
  sprite.filters = [filter];
  return Object.assign(sprite, {
    relight: (source: { x: number, y: number }) => {
      let greyscale = 0xff * light;
      sprite.tint = greyscale | greyscale << 8 | greyscale << 16;
      if (shadow) filter.relight(sprite, source);
    },
    setHover: (d: number) => {
      filter.depth = d
    },
  });
}