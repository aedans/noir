import { useCallback, useState } from "react";
import CardList, { CardListProps } from "./CardList.js";
import React from "react";
import { Container } from "@pixi/react";

export default function ExpandableCardList(props: Omit<CardListProps, "expanded">) {
  const [isExpanded, setIsExpanded] = useState(false);

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
}
