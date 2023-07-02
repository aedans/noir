import React from "react";
import { useEffect, useRef, useState } from "react";
import RemoteCardInfoCache, { getCards, isLoaded, serverOrigin } from "../cards.js";
import Grid from "./Grid.js";
import { useClientDispatch, useClientSelector } from "../store.js";
import { defaultCardState } from "../../common/gameSlice.js";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice.js";
import { targetResolution } from "../Camera.js";
import Rectangle from "../Rectangle.js";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation.js";
import { ordered } from "../../common/util.js";
import { Container, useApp } from "@pixi/react";
import { cardHeight, cardWidth } from "../Card.js";
import Text from "../Text.js";
import CardList from "../CardList.js";
import { useCardInfoList } from "../cardinfolist.js";
import CardInfoCache from "../../common/CardInfoCache.js";
import { CacheContext } from "../game/Game.js";
import { DndProvider } from "react-dnd";
import PIXIBackend from "../PIXIBackend.js";
import EditorCard from "./EditorCard.js";
import { User } from "../../server/db.js";
import { CardCosmetic, CardState } from "../../common/card.js";
import { GameCardProps } from "../game/GameCard.js";

export default function Editor(props: { params: { deck: string } }) {
  const app = useApp();
  const dispatch = useClientDispatch();
  const cards = useRef({} as MoveAnimationState);
  const [scroll, setScroll] = useState(0);
  const [user, setUser] = useState(null as User | null);
  const [top, setTop] = useState([] as string[]);
  const cache = useRef(new RemoteCardInfoCache() as CardInfoCache);

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

  function getCosmetic(name: string): CardCosmetic {
    // if (top.includes(name)) {
    //   return { level: "top" };
    // } else {
    const exp = user?.experience[name] ?? 0;
    const level = exp < 10 ? 0 : exp < 50 ? 1 : exp < 250 ? 2 : 3;
    return { level };
    // }
  }

  useEffect(() => {
    getCards().then(setAllCardNames);

    fetch(`${serverOrigin}/user`)
      .then((x) => x.json())
      .then((user) => {
        setUser(user);
      });

    fetch(`${serverOrigin}/top`)
      .then((x) => x.json())
      .then((top) => {
        setTop(top);
      });

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

  const gridCard = React.useCallback(
    (data: CardState, x: number, y: number) => (
      <EditorCard
        state={data}
        info={new RemoteCardInfoCache().getDefaultCardInfo(data)}
        cosmetic={getCosmetic(data.name)}
        key={data.id}
        pointerdown={pointerdownAdd(data.name)}
        interactive={areCardsLoaded}
        x={x + cardWidth / 2}
        y={y + cardHeight / 2}
      />
    ),
    [user, top]
  );

  const deckCard = React.useCallback(
    (props: GameCardProps) => (
      <EditorCard
        {...props}
        pointerdown={pointerdownRemove(props.state.name)}
        cosmetic={getCosmetic(props.state.name)}
      />
    ),
    [user, top]
  );

  return (
    <DndProvider backend={PIXIBackend(app)}>
      <CacheContext.Provider value={cache.current}>
        <MoveAnimationContext.Provider value={cards}>
          <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
          <Text x={3800} text={Object.values(deck.cards).reduce((a, b) => a + b, 0) + " / 20"} />
          <Container y={scroll}>
            <Grid elements={sortedAllCards} maxWidth={3000} card={gridCard} />
          </Container>
          <Container x={targetResolution.width - cardWidth} y={100}>
            <CardList cards={sortedDeckCards} card={deckCard} expanded />
          </Container>
        </MoveAnimationContext.Provider>
      </CacheContext.Provider>
    </DndProvider>
  );
}
