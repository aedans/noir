import React, {
  MutableRefObject,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import { Container } from "@pixi/react";
import { CardColors, CardState } from "../../common/card.js";
import Card, { CardProps, cardHeight, cardWidth, combineColors, isCardPropsEqual } from "../Card.js";
import { CacheContext, ConnectionContext, CosmeticContext, HelpContext, HighlightContext } from "./Game.js";
import { getCard } from "../../common/gameSlice.js";
import { useClientSelector } from "../store.js";
import { hex } from "../color.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";
import { useMoveAnimation } from "../animation.js";

export type GameCardProps = CardProps &
  Parameters<typeof Container>[0] & {
    scale?: number;
    useLastPos?: boolean;
    x?: number;
    y?: number;
    zIndex?: number;
    angle?: number;
    interactive?: boolean;
    zoomOffsetX?: number;
    zoomOffsetY?: number;
  };

export const gameCardScale = 1;
export const gameCardZoom = 1.2;
export const gameCardWidth = cardWidth * gameCardScale;
export const gameCardHeight = cardHeight * gameCardScale;
export const gameCardWidthDiff = (gameCardWidth * (gameCardZoom - 1)) / 2
export const gameCardHeightDiff = (gameCardHeight * (gameCardZoom - 1)) / 2

export function isGameCardPropsEqual(a: GameCardProps, b: GameCardProps) {
  return (
    isCardPropsEqual(a, b) &&
    a.scale == b.scale &&
    a.useLastPos == b.useLastPos &&
    a.x == b.x &&
    a.y == b.y &&
    a.zIndex == b.zIndex &&
    a.angle == b.angle &&
    a.interactive == b.interactive
  );
}

export default React.memo(
  React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<PixiContainer>) {
    const game = useClientSelector((state) => state.game.current);
    const cache = useContext(CacheContext);
    const connection = useContext(ConnectionContext);
    const { highlight } = useContext(HighlightContext);
    const cosmetics = useContext(CosmeticContext);
    const { setHelp } = useContext(HelpContext);
    const componentRef = useRef() as MutableRefObject<PixiContainer>;
    const [zoom, setZoom] = useState(false);
    useImperativeHandle(ref, () => componentRef.current);

    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: "target",
        drop: (state: CardState) => {
          connection.emit({ type: "do", id: state.id, target: { id: props.state.id } });
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      []
    );

    useEffect(() => {
      drop(componentRef);

      return () => {
        onmouseout();
      };
    }, []);

    useLayoutEffect(() => {
      (componentRef.current as any).convertTo3d?.();
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

    const { x, y, scale } = useMoveAnimation(props.state.id, {
      componentRef,
      x: (props.x ?? 0) + (zoom ? props.zoomOffsetX ?? 0 : 0),
      y: (props.y ?? 0) + (zoom ? props.zoomOffsetY ?? 0 : 0),
      scale: (props.scale ?? 1) * (shouldHighlight ? 1.1 : 1) * gameCardScale * (zoom ? gameCardZoom : 1),
    });

    let isMousedOver = false;

    const onmouseover = useCallback(() => {
      setZoom(true);
      isMousedOver = true;
      setTimeout(() => {
        if (isMousedOver) {
          setHelp(props.state);
        }
      }, 1000);
    }, []);

    const onmouseout = useCallback(() => {
      setZoom(false);
      isMousedOver = false;
      setHelp(null);
    }, []);

    return (
      <Container
        {...props}
        x={x}
        y={y}
        scale={scale}
        onmouseover={onmouseover}
        onmouseout={onmouseout}
        interactive
        ref={componentRef}
      >
        <Card
          state={props.state}
          info={props.info}
          cosmetic={cosmetics[props.state.id]}
          shouldGlow={props.shouldGlow || isOver || shouldHighlight}
          shouldDimWhenExhausted={props.shouldDimWhenExhausted}
          borderTint={borderColors.length == 0 ? undefined : hex[combineColors(borderColors)]}
        />
      </Container>
    );
  }),
  isGameCardPropsEqual
);
