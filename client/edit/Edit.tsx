import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCards, useCardInfoList } from "../cards";
import Grid from "../Grid";
import Card, { cardHeight, cardWidth } from "../Card";
import { useClientDispatch, useClientSelector } from "../store";
import { defaultCardState } from "../../common/gameSlice";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice";
import { targetResolution } from "../Camera";
import Rectangle from "../Rectangle";
import { compareColor, compareMoney, mapSorted } from "../../common/sort";

export default function Edit() {
  const [searchParams] = useSearchParams();
  const dispatch = useClientDispatch();

  const deckName = searchParams.get("deck")!;
  const deck = useClientSelector((game) => game.decks[deckName]);
  const deckCards = useCardInfoList(
    Object.entries(deck.cards).flatMap(([name, number]) => {
      return Array.from(Array(number).keys()).map((_, index) => defaultCardState(name, `${name} ${index}`));
    }),
    [deck.cards]
  );

  const [allCardNames, setAllCardNames] = useState([] as string[]);
  const allCards = useCardInfoList(
    allCardNames.map((card) => defaultCardState(card, card)),
    [allCardNames]
  );

  const sortedAllCards = mapSorted(allCards, (card) => card.info, compareColor, compareMoney).map((card) => card.state);
  const sortedDeckCards = mapSorted(deckCards, (card) => card.info, compareColor, compareMoney).map((card) => card.state);

  useEffect(() => {
    getCards().then(setAllCardNames);
  }, []);

  const pointerdownRemove = (name: string) =>
    function () {
      dispatch(removeDeckCard({ deck: deckName, name }));
    };

  const pointerdownAdd = (name: string) =>
    function () {
      dispatch(addDeckCard({ deck: deckName, name }));
    };

  return (
    <>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Grid maxWidth={0} x={targetResolution.width - cardWidth / 4} data={sortedDeckCards} margin={{ x: 1, y: 0.12 }}>
        {(data, ref, x, y) => (
          <Card
            state={data}
            key={data.id}
            ref={ref}
            scale={1 / 4}
            pointerdown={pointerdownRemove(data.name)}
            interactive
            x={x + cardWidth / 8}
            y={y + cardHeight / 8}
          />
        )}
      </Grid>
      <Grid data={sortedAllCards} maxWidth={3500}>
        {(data, ref, x, y) => (
          <Card
            state={defaultCardState(data.id, data.id)}
            key={data.id}
            ref={ref}
            scale={1 / 4}
            pointerdown={pointerdownAdd(data.id)}
            interactive
            x={x + cardWidth / 8}
            y={y + cardHeight / 8}
          />
        )}
      </Grid>
    </>
  );
}
