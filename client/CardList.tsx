import React, { ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { Container } from "@pixi/react";
import { CardState, CardStateInfo } from "../common/card.js";
import { isCardInfoEqual, isCardStateEqual } from "./Card.js";
import { GameCardProps } from "./game/GameCard.js";
import { CacheContext } from "./game/Game.js";
import { isLoaded, loadCard } from "./cards.js";

export type CardListProps = {
  x: number;
  y: number;
  cardWidth: number;
  cardHeight: number;
  hoverScale?: number;
  cards: CardStateInfo[];
  expanded?: boolean;
  reversed?: boolean;
  expandOnHover?: boolean;
  card: (props: GameCardProps) => ReactElement;
};

export function isCardListPropsEqual(a: CardListProps, b: CardListProps) {
  return (
    a.x == b.x &&
    a.y == b.y &&
    a.cardWidth == b.cardWidth &&
    a.cardHeight == b.cardHeight &&
    a.hoverScale == b.hoverScale &&
    a.expandOnHover == b.expandOnHover &&
    a.expanded == b.expanded &&
    a.reversed == b.reversed &&
    a.cards.length == b.cards.length &&
    a.card == b.card &&
    a.cards.every(
      (_, index) =>
        isCardStateEqual(a.cards[index].state, b.cards[index].state) &&
        isCardInfoEqual(a.cards[index].info, b.cards[index].info)
    )
  );
}

export function useCardInfoList(states: CardState[], deps: ReadonlyArray<unknown>) {
  const [cards, setCards] = useState([] as CardStateInfo[]);
  const cache = useContext(CacheContext);

  function resetCards() {
    setCards(
      states.filter((card) => isLoaded(card)).map((state) => ({ state, info: cache.getDefaultCardInfo(state) }))
    );
  }

  useEffect(() => {
    const promises: Promise<any>[] = [];
    for (const card of states.filter((c) => !isLoaded(c))) {
      try {
        promises.push(loadCard(card).then(() => resetCards()));
      } catch (e) {
        console.error(e);
      }
    }

    Promise.all(promises).then(() => resetCards());
  }, deps);

  return cards;
}

export default React.memo(function CardList(props: CardListProps) {
  const collapsedIndex = props.reversed ? 0 : 999;
  const [expandedIndex, setExpandedIndex] = useState(collapsedIndex);

  const pointerover = useCallback(
    (index: number) => {
      if (props.expandOnHover) {
        if (index >= props.cards.length) {
          setExpandedIndex(collapsedIndex);
        } else {
          setExpandedIndex(index);
        }
      }
    },
    [props.expandOnHover, props.cards.length, collapsedIndex]
  );

  const pointerout = useCallback(() => {
    setExpandedIndex(collapsedIndex);
  }, [collapsedIndex]);

  return (
    <Container pointerout={pointerout} eventMode="static" sortableChildren>
      {props.cards.map(({ state, info }, i) => {
        const heightOffset = (props.reversed ? i : -i) * props.cardHeight * (props.expanded ? 0.1 : 0);
        const shouldHoverOffset = props.expanded && (props.reversed ? i < expandedIndex : i > expandedIndex);
        const hoverOffset = shouldHoverOffset ? props.cardHeight * ((props.hoverScale ?? 1) - 0.2) : 0;
        return (
          <props.card
            zIndex={20 + (props.reversed ? -i : i)}
            state={state}
            info={info}
            key={state.id}
            x={props.x + props.cardWidth / 2}
            y={props.y + props.cardHeight / 2 - heightOffset + hoverOffset}
            pointerover={() => pointerover(i)}
            eventMode="static"
          />
        );
      })}
    </Container>
  );
}, isCardListPropsEqual);
