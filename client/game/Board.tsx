import React, { MutableRefObject, Ref, useContext, useImperativeHandle, useRef } from "react";
import { cardHeight, getCardColor } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { PlayerContext, SocketContext } from "./Game";
import GameCard, { gameCardHeight, GameCardProps, gameCardWidth } from "./GameCard";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { Container } from "react-pixi-fiber";
import { GlowFilter } from "@pixi/filter-glow";
import { currentPlayer } from "../../common/util";
import { defaultUtil, useCardInfo } from "../cards";

const BoardCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const cardInfo = useCardInfo(game, props.state);

  useImperativeHandle(ref, () => cardRef.current);

  function pointerdown() {
    socket.emit("action", { type: "do", id: props.state.id });
  }

  const shouldGlow =
    props.state.prepared &&
    cardInfo.hasActivateEffect &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(game, player, cardInfo.colors, cardInfo.activateCost);

  const filter = new GlowFilter({
    color: getCardColor(cardInfo),
    quality: 1,
    outerStrength: shouldGlow ? 4 : 0,
  });

  return <GameCard {...props} filters={[filter]} ref={cardRef} interactive pointerdown={pointerdown} />;
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

  const x = (targetResolution.width - cards.length * (gameCardWidth + 10)) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (2 / 4) + gameCardHeight / 2;

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
            <BoardCard state={state} status={status} key={state.id} x={x + i * (gameCardWidth + 10)} y={y} />
          ) : (
            <BoardCard useLastPos={true} state={state} status={status} key={state.id} />
          )
        }
      </EnterExitAnimator>
    </>
  );
}
