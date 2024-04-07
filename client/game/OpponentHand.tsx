import React from "react";
import { useContext } from "react";
import { opponentOf } from "../../common/gameSlice.js";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import GameCard, { gameCardHeight, gameCardHeightDiff, gameCardWidth } from "./GameCard.js";
import { Container } from "@pixi/react";
import { useTimeShadowFilter } from "../time.js";
import { useCardInfoList } from "../CardList.js";

export default function OpponentHand() {
  const player = useContext(PlayerContext);
  const deck = useClientSelector((state) => state.game.players[opponentOf(player)].deck);
  const cards = useCardInfoList(deck, [deck]);
  const timeShadowFilterRef = useTimeShadowFilter(10);

  let offset = gameCardWidth - 20;
  if (offset * deck.length > 2500) {
    offset /= (offset * deck.length) / 2500;
  }

  const x = (targetResolution.width - deck.length * offset) / 2 + gameCardWidth / 2;
  const y = gameCardHeight / 2;

  return (
    <Container filters={[timeShadowFilterRef.current]} sortableChildren zIndex={1}>
      {cards.map(({ state, info }, i) => (
        <GameCard
          zIndex={20 + i}
          state={state}
          info={info}
          key={state.id}
          x={x + i * offset}
          y={y}
          zoomOffsetY={gameCardHeightDiff}
        />
      ))}
    </Container>
  );
}
