import React from "react";
import { useEffect, useRef, useState } from "react";
import RemoteCardInfoCache, { getCards, isLoaded } from "../cards.js";
import Grid from "./Grid.js";
import { useClientDispatch, useClientSelector } from "../store.js";
import { defaultCardState } from "../../common/gameSlice.js";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice.js";
import { targetResolution } from "../Camera.js";
import Rectangle from "../Rectangle.js";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation.js";
import GridCard from "./GridCard.js";
import { ordered } from "../../common/util.js";
import { Container } from "react-pixi-fiber";
import { cardHeight, cardWidth } from "../Card.js";
import Text from "../Text.js";
import CardList from "../CardList.js";
import GameCard from "../game/GameCard.js";
import { useCardInfoList } from "../cardinfolist.js";

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
  const sortedDeckCards = ordered(deckCards, ["color", "money"], (card) => card.info);

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
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Text x={3800} text={Object.values(deck.cards).reduce((a, b) => a + b, 0) + " / 20"} />
      <Container y={scroll}>
        <Grid elements={sortedAllCards} maxWidth={3000}>
          {(data, x, y) => (
            <GridCard
              state={data}
              info={new RemoteCardInfoCache().getDefaultCardInfo(data)}
              key={data.id}
              pointerdown={pointerdownAdd(data.name)}
              interactive={areCardsLoaded}
              x={x + cardWidth / 2}
              y={y + cardHeight / 2}
            />
          )}
        </Grid>
      </Container>
      <Container x={targetResolution.width - cardWidth} y={100}>
        <CardList
          cards={sortedDeckCards}
          card={(props) => <GameCard {...props} pointerdown={pointerdownRemove(props.state.name)} />}
          expanded
          collapseOnPointerOut
        />
      </Container>
    </MoveAnimationContext.Provider>
  );
}
