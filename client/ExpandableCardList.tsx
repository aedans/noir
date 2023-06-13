import { useState } from "react";
import CardList, { CardListProps } from "./CardList";
import React from "react";

export function ExpandableCardList(props: Omit<CardListProps, "expanded">) {
  const [isExpanded, setIsExpanded] = useState(false);

  function pointerdown() {
    if (props.cards.length > 0) {
      setIsExpanded(!isExpanded);
    }
  }

  return <CardList expanded={isExpanded} expandOnHover {...props} pointerdown={pointerdown} />;
}
