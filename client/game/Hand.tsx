import { InteractionEvent } from "pixi.js";
import React, { createRef, Ref, useContext } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { currentPlayer } from "../../common/util";
import { targetResolution } from "../Camera";
import { cardWidth } from "../Card";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, GameCardProps, gameCardWidth } from "./GameCard";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const turn = useClientSelector((state) => state.game.turn);
  const player = useContext(PlayerContext);
  const isTurn = currentPlayer({ turn }) == player;

  const [{}, drag] = useDrag(() => ({
    type: "card",
    item: props.state,
    collect: () => ({}),
  }));

  function pointerdown(e: InteractionEvent) {
    if (isTurn) {
      drag({ current: e.target });
    }
  }

  return <GameCard {...props} ref={ref} interactive pointerdown={pointerdown} />;
});

export default function Hand() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.players[player].deck);

  const x = (targetResolution.width - cards.length * (gameCardWidth + 10)) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + gameCardHeight / 2;

  return (
    <EnterExitAnimator elements={cards}>
      {(state, status, i) =>
        i != null ? (
          <HandCard zIndex={20 + i} state={state} status={status} key={state.id} x={x + i * (gameCardWidth + 10)} y={y} />
        ) : (
          <HandCard useLastPos={true} state={state} status={status} key={state.id} ref={createRef()} />
        )
      }
    </EnterExitAnimator>
  );
}
