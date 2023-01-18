import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Container, Sprite } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { HoverContext, PlayerContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";
import { defaultUtil, useCardInfo, useCardInfoList } from "../cards";
import Reticle from "./Reticle";
import { getCardColor, smallCardHeight, smallCardScale, smallCardWidth } from "../Card";
import { ordered } from "../../common/util";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Sprite>>;
  const cardInfo = useCardInfo(props.state);
  const [zoom, setZoom] = useState(false);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.targets ? targetRef : cardRef);
    }

    return () => setHover([]);
  }, [cardInfo]);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: cardInfo.targets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    [cardInfo]
  );

  let x = props.x;
  let y = props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  function pointerover() {
    if (!isDragging) {
      setZoom(true);

      const result = defaultUtil.tryPayCost(
        game,
        props.state,
        "play",
        props.state.name,
        player,
        cardInfo.colors,
        cardInfo.cost,
        cardInfo.targets
      );

      if (typeof result != "string") {
        setHover(result.agents);
      }
    }
  }

  function pointerout() {
    if (!isDragging) {
      setZoom(false);
      setHover([]);
    }
  }

  const card = (
    <GameCard
      {...props}
      shadow={20}
      x={x}
      y={zoom ? (y ?? 0) - smallCardHeight / 10 : y}
      scale={zoom ? smallCardScale * 1.2 : smallCardScale}
      zIndex={zoom ? 100 : props.zIndex}
      ref={cardRef}
      interactive={props.status != "exiting"}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  if (cardInfo.targets) {
    const target = (
      <Reticle
        x={x}
        y={y}
        ref={targetRef}
        isDragging={isDragging}
        color={getCardColor(cardInfo)}
        angle={props.angle}
        pointerover={pointerover}
        pointerout={pointerout}
      />
    );
    return (
      <>
        {card}
        {target}
      </>
    );
  } else {
    return card;
  }
});

export default function Hand() {
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck);

  const hand = cards.filter((card) =>
    defaultUtil.canPayCost(game, card.state, player, card.info.colors, card.info.cost, card.info.targets)
  );
  const sortedHand = ordered(hand, ["money"], (card) => card.info).map((card) => card.state);

  let offset = smallCardWidth - 20;
  if (offset * hand.length > 2500) {
    offset /= (offset * hand.length) / 2500;
  }

  const x = (targetResolution.width - hand.length * offset) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + smallCardHeight / 2 + 20;

  return (
    <EnterExitAnimator elements={sortedHand}>
      {(state, status, i) =>
        i != null ? (
          <HandCard
            zIndex={20 + i}
            state={state}
            status={status}
            key={state.id}
            x={x + i * offset}
            y={y + Math.abs((i - (hand.length - 1) / 2.0) * 10)}
            angle={(i - (hand.length - 1) / 2.0) * 1}
          />
        ) : (
          <HandCard useLastPos={true} state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
