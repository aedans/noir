import React, { useEffect, useRef, useState } from "react";
import { getCards, useCardInfoList } from "../cards";
import Grid from "../Grid";
import { smallCardHeight, smallCardWidth } from "../Card";
import { useClientDispatch, useClientSelector } from "../store";
import { defaultCardState } from "../../common/gameSlice";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice";
import { targetResolution } from "../Camera";
import Rectangle from "../Rectangle";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import EditorCard from "./EditorCard";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { ordered } from "../../common/util";

export default function Editor(props: { params: { deck: string } }) {
  const dispatch = useClientDispatch();
  const cards = useRef({} as MoveAnimationState);

  const deckName = props.params.deck;
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

  const sortedAllCards = ordered(allCards, ["color", "money"], card => card.info).map((card) => card.state);
  const sortedDeckCards = ordered(deckCards, ["color", "money"], card => card.info).map((card) => card.state);

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
      <Grid elements={sortedAllCards} maxWidth={3000}>
        {(data, ref, x, y) => (
          <EditorCard
            state={data}
            status="none"
            key={data.id}
            ref={ref}
            pointerdown={pointerdownAdd(data.name)}
            interactive
            x={x + smallCardWidth / 2}
            y={y + smallCardHeight / 2}
          />
        )}
      </Grid>
      <EnterExitAnimator
        x={targetResolution.width - smallCardWidth / 2}
        y={smallCardHeight / 2}
        elements={sortedDeckCards}
      >
        {(data, status, i) =>
          i != null ? (
            <EditorCard
              state={data}
              status={status}
              key={data.id}
              pointerdown={pointerdownRemove(data.name)}
              interactive
              y={(i * smallCardHeight) / 8 ?? 0}
            />
          ) : (
            <EditorCard state={data} status={status} key={data.id} useLastPos={true} />
          )
        }
      </EnterExitAnimator>
    </MoveAnimationContext.Provider>
  );
}
