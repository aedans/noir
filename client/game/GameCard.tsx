import { DisplayObject, Graphics, Ticker } from "pixi.js";
import React, {
  MutableRefObject,
  Ref,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  Context,
  useContext,
} from "react";
import { Container } from "react-pixi-fiber";
import { findCard } from "../../common/gameSlice";
import { animateTime, animateTo } from "../animation";
import Card, { cardHeight, CardProps, cardWidth } from "../Card";
import { useClientSelector } from "../store";
import { CameraContext } from "../Camera";

export type GameCardStates = { [id: string]: { x: number; y: number } };

export const GameCardContext = React.createContext(undefined as unknown) as Context<MutableRefObject<GameCardStates>>;

export const GameCard = React.forwardRef(function GameCard(props: CardProps, ref: Ref<Container>) {
  const cards = useContext(GameCardContext);
  const camera = useContext(CameraContext);
  const game = useClientSelector((state) => state.game);
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  useEffect(() => {
    function onTick() {
      if (componentRef.current) {
        cards.current[props.state.id] = componentRef.current.getGlobalPosition();
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  });

  useLayoutEffect(() => {
    const prevPosition = cards.current[props.state.id];
    if (prevPosition) {
      const nextPosition = componentRef.current.getGlobalPosition();
      componentRef.current.transform.position.copyFrom(componentRef.current.parent.toLocal(prevPosition));
      animateTo(componentRef.current, nextPosition);
    }

    return () => {
      const { zone } = findCard(props.state.id, game);
      if (zone == "graveyard") {
        const graphics = new Graphics();
        graphics.clear();
        graphics.beginFill(0xffffff);
        graphics.drawRect(0, 0, cardWidth / 4, cardHeight / 4);
        graphics.endFill();
        graphics.transform.position.copyFrom(camera.current.toLocal(componentRef.current.getGlobalPosition()));
        camera.current.addChild(graphics);

        graphics.pivot.set(graphics.width / 2, graphics.height / 2);
        graphics.x += graphics.width / 2;
        graphics.y += graphics.height / 2;
        animateTime(5, (time) => {
          graphics.scale.set(1 - time);
        });
      }
    };
  });

  return <Card {...props} ref={componentRef} />;
});
