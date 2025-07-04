import React, {
  MutableRefObject,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import { CardColors, CardState } from "../../common/card.js";
import { cardHeight, cardWidth, combineColors, isCardPropsEqual } from "../Card.js";
import { CacheContext, CosmeticContext, HighlightContext, PlanContext } from "./Game.js";
import { findCard, getCard } from "../../common/gameSlice.js";
import { useClientSelector } from "../store.js";
import { hex } from "../color.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";
import AnimatedCard, { AnimatedCardProps, isAnimatedCardPropsEqual } from "../AnimatedCard.js";

export type GameCardProps = AnimatedCardProps & {
  useLastPos?: boolean;
  zoomOffsetX?: number;
  zoomOffsetY?: number;
};

export const gameCardScale = 0.9;
export const gameCardZoomScale = 1;
export const gameCardZoom = gameCardZoomScale / gameCardScale;
export const gameCardWidth = cardWidth * gameCardScale;
export const gameCardHeight = cardHeight * gameCardScale;
export const gameCardWidthDiff = (gameCardWidth * (gameCardZoom - 1)) / 2;
export const gameCardHeightDiff = (gameCardHeight * (gameCardZoom - 1)) / 2;

export function isGameCardPropsEqual(a: GameCardProps, b: GameCardProps) {
  return (
    isAnimatedCardPropsEqual(a, b) &&
    a.useLastPos == b.useLastPos &&
    a.zoomOffsetX == b.zoomOffsetX &&
    a.zoomOffsetY == b.zoomOffsetY
  );
}

export default React.memo(
  React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<PixiContainer>) {
    const game = useClientSelector((state) => state.game);
    const cache = useContext(CacheContext);
    const { highlight } = useContext(HighlightContext);
    const cosmetics = useContext(CosmeticContext);
    const { setPlan } = useContext(PlanContext);
    const componentRef = useRef() as MutableRefObject<PixiContainer>;
    const [zoom, setZoom] = useState(false);
    useImperativeHandle(ref, () => componentRef.current);

    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: "target",
        drop: (state: CardState) => {
          const found = findCard(game, state);
          if (!found) {
            return;
          }

          const info = cache.getCardInfo(game, state);
          if (
            (found.zone == "deck" &&
              info.targets &&
              util.filter(cache, game, info.targets).some((c) => c.id == props.state.id)) ||
            (found.zone == "board" &&
              info.activateTargets &&
              util.filter(cache, game, info.activateTargets).some((c) => c.id == props.state.id))
          ) {
            setPlan((plan) => [
              ...plan,
              {
                type: found.zone == "deck" ? "play" : "activate",
                card: state,
                action: { id: state.id, target: { id: props.state.id } },
              },
            ]);
          }
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [game, props.state]
    );

    useEffect(() => {
      drop(componentRef);
    }, []);

    const borderColors: CardColors[] = [];
    for (const modifier of props.state.modifiers) {
      const card = getCard(game, modifier.card);
      if (card) {
        const info = cache.getCardInfo(game, card);
        borderColors.push(combineColors(info.colors));
      }
    }

    for (const card of util.filter(cache, game, { zones: ["board"] })) {
      const info = cache.getCardInfo(game, card);
      if (util.filter(cache, game, info.effectFilter).find((c) => c.id == props.state.id)) {
        if (Object.entries(info.effect(props.info, props.state) ?? {}).length > 0) {
          borderColors.push(combineColors(info.colors));
        }
      }

      if (util.filter(cache, game, info.secondaryEffectFilter).find((c) => c.id == props.state.id)) {
        if (Object.entries(info.secondaryEffect(props.info, props.state) ?? {}).length > 0) {
          borderColors.push(combineColors(info.colors));
        }
      }
    }

    const shouldHighlight = (highlight?.findIndex((h) => h.id == props.state.id) ?? -1) != -1;

    const pointerover = useCallback(
      (e) => {
        props.pointerover?.(e);
        setZoom(true);
      },
      [props.pointerover]
    );

    const pointerout = useCallback(
      (e) => {
        props.pointerout?.(e);
        setZoom(false);
      },
      [props.pointerout]
    );

    return (
      <AnimatedCard
        {...props}
        x={(props.x ?? 0) + (zoom ? props.zoomOffsetX ?? 0 : 0)}
        y={(props.y ?? 0) + (zoom ? props.zoomOffsetY ?? 0 : 0)}
        scale={(props.scale ?? 1) * (shouldHighlight ? 1.1 : 1) * gameCardScale * (zoom ? gameCardZoom : 1)}
        pointerover={pointerover}
        pointerout={pointerout}
        eventMode="static"
        ref={componentRef}
        state={props.state}
        info={props.info}
        cosmetic={cosmetics[props.state.id]}
        shouldGlow={props.shouldGlow || isOver || shouldHighlight}
        shouldDimWhenExhausted={props.shouldDimWhenExhausted}
        borderTint={borderColors.length == 0 ? undefined : hex[combineColors(borderColors)]}
      />
    );
  }),
  isGameCardPropsEqual
);
