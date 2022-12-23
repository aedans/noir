import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCards as getAllCards } from "../cards";
import Grid from "../Grid";
import Card, { cardHeight, cardWidth } from "../Card";
import { useClientDispatch, useClientSelector } from "../store";
import { defaultCardState } from "../../common/gameSlice";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice";
import { targetResolution } from "../Camera";
import Rectangle from "../Rectangle";

export default function Edit() {
  const [searchParams] = useSearchParams();
  const deckName = searchParams.get("deck")!;
  const deck = useClientSelector((game) => game.decks[deckName]);
  const dispatch = useClientDispatch();
  const [allCards, setAllCards] = useState([] as string[]);

  useEffect(() => {
    getAllCards().then(setAllCards);
  }, []);

  const pointerdownRemove = (name: string) =>
    function () {
      dispatch(removeDeckCard({ deck: deckName, name }));
    };

  const pointerdownAdd = (name: string) =>
    function () {
      dispatch(addDeckCard({ deck: deckName, name }));
    };

  const cards = Object.entries(deck.cards).flatMap(([name, number]) =>
    Array.from(Array(number).keys()).map((_, index) => ({ name, index, id: `${name} ${index}` }))
  );

  return (
    <>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Grid maxWidth={0} x={targetResolution.width - cardWidth / 4} data={cards} margin={{ x: 1, y: 0.12 }}>
        {(data, ref, x, y) => (
          <Card
            state={defaultCardState(data.name, data.id)}
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
      <Grid data={allCards.map((id) => ({ id }))} maxWidth={3500}>
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
