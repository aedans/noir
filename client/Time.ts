import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { filters as PixiFilters } from "pixi.js";
import { useClientSelector } from "./store";
import anime from "animejs";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { PlayerContext } from "./game/Game";

const colors = [
  // day
  0xfff2bd, 0xfff2bd, 0xfff2bd, 0xfff2bd, 0xb5728e,
  // night
  0x2d1b5a, 0x2d1b5a, 0x2d1b5a, 0x2d1b5a, 0xE38E71,
];

const shadows = [
  //day
  [1, 45, 1],
  [2, 40, 0.8],
  [3, 35, 0.6],
  [4, 30, 0.4],
  [5, 25, 0.2],
  //night
  [5, 25, 0],
  [5, 25, 0.2],
  [4, 30, 0.4],
  [3, 35, 0.6],
  [2, 40, 0.8],
];

export function useTimeColorFilter() {
  const player = useContext(PlayerContext);
  const turn = useClientSelector((state) => Math.floor((state.game.current.turn - player + 1) / 2) % colors.length);
  const colorFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
  const lastColor = useRef({
    r: (colors[turn] & 0xff0000) >> 16,
    g: (colors[turn] & 0x00ff00) >> 8,
    b: colors[turn] & 0x0000ff,
  });

  useLayoutEffect(() => {
    colorFilterRef.current.alpha = 0.6;
    colorFilterRef.current.tint(colors[turn], true);
  }, []);

  useEffect(() => {
    anime({
      targets: lastColor.current,
      duration: 500,
      easing: "linear",
      r: (colors[turn] & 0xff0000) >> 16,
      g: (colors[turn] & 0x00ff00) >> 8,
      b: colors[turn] & 0x0000ff,
      update() {
        const currentColor = (lastColor.current.r << 16) | (lastColor.current.g << 8) | lastColor.current.b;
        colorFilterRef.current.reset();
        colorFilterRef.current.tint(currentColor, true);
      },
    });
  }, [turn]);

  return colorFilterRef;
}

export function useTimeShadowFilter(shadow: number) {
  const player = useContext(PlayerContext);
  const turn = useClientSelector((state) => Math.floor((state.game.current.turn - player + 1) / 2) % shadows.length);
  const shadowFilterRef = useRef(new DropShadowFilter({ blur: 1 }));

  useLayoutEffect(() => {
    const [distance, rotation, alpha] = shadows[turn];
    shadowFilterRef.current.distance = distance * shadow;
    shadowFilterRef.current.rotation = rotation;
    shadowFilterRef.current.alpha = alpha;
  }, []);

  useEffect(() => {
    const [distance, rotation, alpha] = shadows[turn];
    anime({
      targets: shadowFilterRef.current,
      duration: 500,
      easing: "linear",
      distance: distance * shadow,
      rotation,
      alpha,
    });
  }, [turn]);

  return shadowFilterRef;
}