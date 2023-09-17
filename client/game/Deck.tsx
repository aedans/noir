import React, { useCallback } from "react";
import { targetResolution } from "../Camera.js";
import { CardStateInfo } from "../../common/card.js";
import GameCard, {
  GameCardProps,
  gameCardHeight,
  gameCardHeightDiff,
  gameCardScale,
  gameCardWidth,
  gameCardWidthDiff,
  gameCardZoom,
} from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const card = useCallback(
    (props: GameCardProps) => <GameCard {...props} zoomOffsetY={gameCardHeightDiff} />,
    []
  );

  const x = targetResolution.width - gameCardWidth - gameCardWidthDiff;
  const y = targetResolution.height - gameCardHeight - gameCardHeightDiff * 2;

  return (
    <ExpandableCardList
      x={x}
      y={y}
      cardWidth={gameCardWidth}
      cardHeight={gameCardHeight}
      reversed
      cards={props.cards}
      card={card}
      hoverScale={gameCardZoom}
    />
  );
}
