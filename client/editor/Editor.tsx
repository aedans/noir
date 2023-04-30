import React, { useEffect, useRef, useState } from "react";
import { defaultUtil, getCards, isLoaded, useCardInfoList } from "../cards";
import Grid from "./Grid";
import { useClientDispatch, useClientSelector } from "../store";
import { defaultCardState } from "../../common/gameSlice";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice";
import { targetResolution } from "../Camera";
import Rectangle from "../Rectangle";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import GridCard from "./GridCard";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { ordered } from "../../common/util";
import { Container } from "react-pixi-fiber";
import DeckCard from "./DeckCard";
import { cardHeight, cardWidth } from "../Card";
import Text from "../Text";

export default function Editor(props: { params: { deck: string } }) {
  const dispatch = useClientDispatch();
  const cards = useRef({} as MoveAnimationState);
  const [scroll, setScroll] = useState(0);

  const deckName = decodeURIComponent(props.params.deck);
  const deck = useClientSelector((game) => game.decks[deckName]);
  const deckCards = useCardInfoList(
    Object.entries(deck.cards).flatMap(([name, number]) =>
      Array.from(Array(number).keys()).map((_, index) => defaultCardState(name, `${name} ${index}`))
    ),
    [deck]
  );

  const [allCardNames, setAllCardNames] = useState([] as string[]);
  const allCards = useCardInfoList(
    allCardNames.map((name) => defaultCardState(name, `${name} ${deck.cards[name] ?? 0}`)),
    [allCardNames, deck]
  );

  const sortedAllCards = ordered(allCards, ["color", "money"], (card) => card.info).map((card) => card.state);
  const sortedDeckCards = ordered(deckCards, ["color", "money"], (card) => card.info).map((card) => card.state);

  const areCardsLoaded = allCardNames.every((name) => isLoaded({ name }));

  useEffect(() => {
    getCards().then(setAllCardNames);

    let scrollY = scroll;
    function onWheel(e: WheelEvent) {
      scrollY -= e.deltaY;
      scrollY = Math.min(0, scrollY);
      setScroll(scrollY);
    }

    window.addEventListener("wheel", onWheel);

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
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
      <Rectangle
        fill={0x202020}
        width={targetResolution.width}
        height={targetResolution.height}
      />
      <Text x={3800} text={Object.values(deck.cards).reduce((a, b) => a + b, 0) + " / 20"} />
      <Container y={scroll}>
        <Grid elements={sortedAllCards} maxWidth={3000}>
          {(data, x, y) => (
            <GridCard
              state={data}
              info={defaultUtil.getDefaultCardInfo(data)}
              key={data.id}
              pointerdown={pointerdownAdd(data.name)}
              interactive={areCardsLoaded}
              x={x + cardWidth / 2}
              y={y + cardHeight / 2}
            />
          )}
        </Grid>
      </Container>
      <Container x={targetResolution.width - cardWidth / 2} y={cardHeight / 2 + 100}>
        <EnterExitAnimator elements={sortedDeckCards}>
          {(data, status, i) =>
            i != null ? (
              <DeckCard
                state={data}
                info={defaultUtil.getDefaultCardInfo(data)}
                status={status}
                key={data.id}
                pointerdown={pointerdownRemove(data.name)}
                interactive
                y={(i * cardHeight) / 8 ?? 0}
              />
            ) : (
              <DeckCard
                state={data}
                info={defaultUtil.getDefaultCardInfo(data)}
                status={status}
                key={data.id}
                useLastPos
              />
            )
          }
        </EnterExitAnimator>
      </Container>
    </MoveAnimationContext.Provider>
  );
}
