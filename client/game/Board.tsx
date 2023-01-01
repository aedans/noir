import React, { MutableRefObject, Ref, useContext, useImperativeHandle, useRef } from "react";
import { cardHeight, smallCardHeight, smallCardWidth } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { HoverContext, PlayerContext, SocketContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { Container } from "react-pixi-fiber";
import { currentPlayer } from "../../common/util";
import { defaultUtil, useCardInfo } from "../cards";

const BoardCard = React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const cardInfo = useCardInfo(props.state);

  useImperativeHandle(ref, () => cardRef.current);

  function pointerdown() {
    socket.emit("action", { type: "do", id: props.state.id });
  }

  function pointerover() {
    const result = defaultUtil.tryPayCost(
      game,
      props.state,
      "activate",
      props.state.name,
      player,
      cardInfo.colors,
      cardInfo.activateCost
    );

    if (typeof result != "string") {
      setHover(result.agents);
    }
  }

  function pointerout() {
    setHover([]);
  }

  const shouldGlow =
    !props.state.exhausted &&
    cardInfo.hasActivateEffect &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(game, props.state, player, cardInfo.colors, cardInfo.activateCost);

  return (
    <GameCard
      {...props}
      shouldGlow={shouldGlow}
      ref={cardRef}
      interactive
      pointerdown={pointerdown}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );
});

export default function Board() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[player].board);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      socket.emit("action", { type: "do", id: state.id });
    },
    collect: () => ({}),
  }));

  const x = (targetResolution.width - cards.length * (smallCardWidth + 10)) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (2 / 4) + smallCardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <EnterExitAnimator elements={cards}>
        {(state, status, i) =>
          i != null ? (
            <BoardCard state={state} status={status} key={state.id} x={x + i * (smallCardWidth + 10)} y={y} />
          ) : (
            <BoardCard useLastPos={true} state={state} status={status} key={state.id} />
          )
        }
      </EnterExitAnimator>
    </>
  );
}
