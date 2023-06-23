import React from "react";
import { useContext } from "react";
import { opponentOf } from "../../common/gameSlice.js";
import { targetResolution } from "../Camera.js";
import { cardHeight, cardWidth } from "../Card.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import GameCard from "./GameCard.js";
import { Container } from "react-pixi-fiber";
import { useTimeShadowFilter } from "../time.js";
import { useCardInfoList } from "../cardinfolist.js";

export default function OpponentHand() {
  const player = useContext(PlayerContext);
  const deck = useClientSelector((state) => state.game.current.players[opponentOf(player)].deck);
  const cards = useCardInfoList(deck, [deck]);
  const timeShadowFilterRef = useTimeShadowFilter(10);

  let offset = cardWidth - 20;
  if (offset * deck.length > 2500) {
    offset /= (offset * deck.length) / 2500;
  }

  const x = (targetResolution.width - deck.length * offset) / 2 + cardWidth / 2;
  const y = cardHeight / 2;

  return (
    <Container filters={[timeShadowFilterRef.current]}>
      {cards.map(({ state, info }, i) => (
        <GameCard zIndex={20 + i} state={state} info={info} key={state.id} x={x + i * offset} y={y} />
      ))}
    </Container>
  );
}
