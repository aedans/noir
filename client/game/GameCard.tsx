import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrop } from "react-dnd";
import { Container, InteractiveComponent } from "react-pixi-fiber";
import { CardColors, CardState } from "../../common/card";
import Card, { CardProps, combineColors, isCardPropsEqual } from "../Card";
import MoveAnimation, { useLastPos } from "../MoveAnimation";
import { ConnectionContext, HighlightContext, PreparedContext } from "./Game";
import { getCard } from "../../common/gameSlice";
import { useClientSelector } from "../store";
import { defaultUtil } from "../cards";
import { hex } from "../color";

export type GameCardProps = CardProps &
  InteractiveComponent & {
    scale?: number;
    useLastPos?: boolean;
    x?: number;
    y?: number;
    zIndex?: number;
    angle?: number;
    interactive?: boolean;
  };

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
  React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
    const game = useClientSelector((state) => state.game.current);
    const connection = useContext(ConnectionContext);
    const { prepared } = useContext(PreparedContext);
    const { highlight } = useContext(HighlightContext);
    const componentRef = useRef() as MutableRefObject<Required<Container>>;
    const { x, y } = useLastPos(props, props.state.id, componentRef);

    useImperativeHandle(ref, () => componentRef.current);

    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: "target",
        drop: (state: CardState) => {
          connection.emit({ type: "do", id: state.id, target: { id: props.state.id }, prepared });
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [prepared]
    );

    useEffect(() => {
      drop(componentRef);
    });

    useEffect(() => {
      (componentRef.current as any).convertTo3d?.();
    }, []);

    const cache = new Map();
    const borderColors: CardColors[] = [];
    for (const modifier of props.state.modifiers) {
      const card = getCard(game, modifier.card);
      if (card) {
        const info = defaultUtil.getCardInfo(cache, game, card);
        borderColors.push(combineColors(info.colors));
      }
    }

    for (const card of defaultUtil.filter(cache, game, { zones: ["board"] })) {
      const info = defaultUtil.getCardInfo(cache, game, card);
      if (defaultUtil.filter(cache, game, info.effectFilter).find((c) => c.id == props.state.id)) {
        if (Object.entries(info.effect(props.info, props.state) ?? {}).length > 0) {
          borderColors.push(combineColors(info.colors));
        }
      }

      if (defaultUtil.filter(cache, game, info.secondaryEffectFilter).find((c) => c.id == props.state.id)) {
        if (Object.entries(info.secondaryEffect(props.info, props.state) ?? {}).length > 0) {
          borderColors.push(combineColors(info.colors));
        }
      }
    }

    const shouldHighlight = (highlight?.findIndex((h) => h.id == props.state.id) ?? -1) != -1
    const scale = (props.scale ?? 1) * (shouldHighlight ? 1.1 : 1);

    return (
      <MoveAnimation id={props.state.id} x={x} y={y} scale={scale} componentRef={componentRef}>
        <Container {...props} scale={0} ref={componentRef}>
          <Card
            state={props.state}
            info={props.info}
            shouldGlow={props.shouldGlow || isOver || shouldHighlight}
            shouldDimWhenExhausted={props.shouldDimWhenExhausted}
            borderTint={borderColors.length == 0 ? undefined : hex[combineColors(borderColors)]}
          />
        </Container>
      </MoveAnimation>
    );
  }),
  isGameCardPropsEqual
);
