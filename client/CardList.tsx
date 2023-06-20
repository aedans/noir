import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { Container } from "react-pixi-fiber";
import { CardStateInfo } from "../common/card";
import { cardHeight, cardWidth, isCardInfoEqual, isCardStateEqual } from "./Card";
import { GameCardProps } from "./game/GameCard";
import { zip } from "lodash";

export type CardListProps = {
  cards: CardStateInfo[];
  expanded?: boolean;
  reversed?: boolean;
  collapseOnPointerOut?: boolean;
  expandOnHover?: boolean;
  card: (props: GameCardProps) => ReactElement;
};

export function isCardListPropsEqual(a: CardListProps, b: CardListProps) {
  return (
    a.expanded == b.expanded &&
    a.reversed == b.reversed &&
    zip(a.cards, b.cards).every(
      ([a, b]) => a && b && isCardStateEqual(a?.state, b?.state) && isCardInfoEqual(a?.info, b?.info)
    )
  );
}

export default React.memo(function CardList(props: CardListProps) {
  const collapsedIndex = props.reversed ? 0 : props.cards.length;
  const [expandedIndex, setExpandedIndex] = useState(collapsedIndex);

  useEffect(() => {
    setExpandedIndex(collapsedIndex);
  }, [props.cards.length]);

  const pointerover = useCallback(
    (index: number) => {
      if (props.expandOnHover) {
        setExpandedIndex(index);
      }
    },
    [props.expandOnHover]
  );

  const pointerout = useCallback(() => {
    if (props.collapseOnPointerOut) {
      setExpandedIndex(collapsedIndex);
    }
  }, [props.collapseOnPointerOut, collapsedIndex]);

  return (
    <Container pointerout={pointerout} interactive>
      {props.cards.map(({ state, info }, i) => {
        const heightOffset = (props.reversed ? i : -i) * cardHeight * (props.expanded ? 0.1 : 0);
        const shouldHoverOffset = props.expanded && (props.reversed ? i < expandedIndex : i > expandedIndex);
        const hoverOffset = shouldHoverOffset ? cardHeight * 0.8 : 0;
        return (
          <props.card
            zIndex={20 + (props.reversed ? -i : i)}
            state={state}
            info={info}
            key={state.id}
            x={cardWidth / 2}
            y={cardHeight / 2 - heightOffset + hoverOffset}
            pointerover={() => pointerover(i)}
            interactive
          />
        );
      })}
    </Container>
  );
}, isCardListPropsEqual);
