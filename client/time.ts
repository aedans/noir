import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { filters as PixiFilters } from "./pixi.js";
import { useClientSelector } from "./store";
import anime from "animejs";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { PlayerContext } from "./game/Game";
import { afternoonColor, dayColor, getColor, getRGB, morningColor, nightColor } from "./color";

const colors = [
  dayColor,
  dayColor,
  dayColor,
  dayColor,
  afternoonColor,
  nightColor,
  nightColor,
  nightColor,
  nightColor,
  morningColor,
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
  const turn = useClientSelector((state) => Math.floor((state.game.turn - player + 1) / 2) % colors.length);
  const colorFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
  const lastColor = useRef(getRGB(colors[turn]));

  useLayoutEffect(() => {
    colorFilterRef.current.alpha = 0.6;
    colorFilterRef.current.tint(colors[turn], true);
  }, []);

  useEffect(() => {
    const { r, g, b } = getRGB(colors[turn]);

    if (lastColor.current.r != r || lastColor.current.g != g || lastColor.current.b != b) {
      anime({
        targets: lastColor.current,
        duration: 500,
        easing: "linear",
        r,
        g,
        b,
        update() {
          const currentColor = getColor(lastColor.current);
          colorFilterRef.current.reset();
          colorFilterRef.current.tint(currentColor, true);
        },
      });
    }
  }, [turn]);

  return colorFilterRef;
}

export function useTimeShadowFilter(shadow: number) {
  const player = useContext(PlayerContext);
  const turn = useClientSelector((state) => Math.floor((state.game.turn - player + 1) / 2) % shadows.length);
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
