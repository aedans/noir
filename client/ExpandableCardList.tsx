import { useCallback, useState } from "react";
import CardList, { CardListProps, isCardListPropsEqual } from "./CardList.js";
import React from "react";
import { Container } from "@pixi/react";

export type ExpandableCardListProps = Omit<CardListProps, "expanded"> & {
  beginExpanded?: boolean;
};

export function isExpandableCardListPropsEqual(a: ExpandableCardListProps, b: ExpandableCardListProps) {
  return isCardListPropsEqual(a, b) && a.beginExpanded == b.beginExpanded;
}

export default React.memo(function ExpandableCardList(props: ExpandableCardListProps) {
  const [isExpanded, setIsExpanded] = useState(props.beginExpanded ?? false);

  const pointerdown = useCallback(() => {
    if (props.cards.length > 0) {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, props.cards.length]);

  return (
    <Container pointerdown={pointerdown} eventMode="static">
      <CardList expanded={isExpanded} expandOnHover {...props} />
    </Container>
  );
});
