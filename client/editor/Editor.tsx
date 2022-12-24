import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCards, useCardInfoList } from "../cards";
import Grid from "../Grid";
import { smallCardHeight, smallCardScale, smallCardWidth } from "../Card";
import { useClientDispatch, useClientSelector } from "../store";
import { defaultCardState } from "../../common/gameSlice";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice";
import { targetResolution } from "../Camera";
import Rectangle from "../Rectangle";
import { compareColor, compareMoney, mapSorted } from "../../common/sort";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import EditorCard from "./EditorCard";

export default function Editor() {
  const [searchParams] = useSearchParams();
  const dispatch = useClientDispatch();
  const cards = useRef({} as MoveAnimationState);

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
    allCardNames.map((name) => defaultCardState(name, `${name} ${deck.cards[name] ?? 0}`)),
    [allCardNames, deck]
  );

  const sortedAllCards = mapSorted(allCards, (card) => card.info, compareColor, compareMoney).map((card) => card.state);
  const sortedDeckCards = mapSorted(deckCards, (card) => card.info, compareColor, compareMoney).map(
    (card) => card.state
  );

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
    <MoveAnimationContext.Provider value={cards}>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Grid elements={sortedAllCards} maxWidth={3500}>
        {(data, ref, x, y) => (
          <EditorCard
            state={data}
            key={data.id}
            ref={ref}
            scale={smallCardScale}
            pointerdown={pointerdownAdd(data.name)}
            interactive
            x={x + smallCardWidth / 2}
            y={y + smallCardHeight / 2}
          />
        )}
      </Grid>
      <Grid maxWidth={0} x={targetResolution.width - smallCardWidth} elements={sortedDeckCards} margin={{ x: 1, y: 0.12 }}>
        {(data, ref, x, y) => (
          <EditorCard
            state={data}
            key={data.id}
            ref={ref}
            scale={smallCardScale}
            pointerdown={pointerdownRemove(data.name)}
            interactive
            x={x + smallCardWidth / 2}
            y={y + smallCardHeight / 2}
          />
        )}
      </Grid>
    </MoveAnimationContext.Provider>
  );
}
