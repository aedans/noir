import React from "react";
import { useEffect, useRef, useState } from "react";
import RemoteCardInfoCache, { isLoaded, trpc } from "../cards.js";
import Grid from "./Grid.js";
import { useClientDispatch, useClientSelector } from "../store.js";
import { defaultCardState } from "../../common/gameSlice.js";
import { addDeckCard, removeDeckCard } from "../../common/decksSlice.js";
import { targetResolution } from "../Camera.js";
import Rectangle from "../Rectangle.js";
import { MoveAnimationContext, MoveAnimationState } from "../animation.js";
import { ordered, validateDeck } from "../../common/util.js";
import { Container, useApp } from "@pixi/react";
import { cardHeight, cardWidth } from "../Card.js";
import Text from "../Text.js";
import CardList from "../CardList.js";
import { useCardInfoList } from "../CardList.js";
import CardInfoCache from "../../common/CardInfoCache.js";
import { CacheContext } from "../game/Game.js";
import { DndProvider } from "react-dnd";
import PIXIBackend from "../PIXIBackend.js";
import EditorCard from "./EditorCard.js";
import { CardCosmetic, CardState } from "../../common/card.js";
import { GameCardProps } from "../game/GameCard.js";
import { User } from "../../common/network.js";

export default function Editor(props: { params: { deck: string } }) {
  const app = useApp();
  const dispatch = useClientDispatch();
  const cards = useRef({} as { [id: string]: MoveAnimationState });
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

  const { errors, actualSize, expectedSize } = Object.keys(deck.cards).every((name) => isLoaded({ name }))
    ? validateDeck(cache.current, deck)
    : { errors: [], actualSize: 0, expectedSize: 20 };

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
    trpc.cards.query().then(setAllCardNames);

    trpc.user.query().then((user) => {
      setUser(user);
    });

    trpc.top.query().then((top) => {
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
          <Text
            x={3800}
            text={`${actualSize} / ${expectedSize}`}
            style={{ tint: errors.length > 0 ? 0xff0000 : 0xffffff }}
          />
          <Container y={scroll}>
            <Grid elements={sortedAllCards} maxWidth={3000} card={gridCard} />
          </Container>
          <CardList x={targetResolution.width - cardWidth} y={100} cards={sortedDeckCards} card={deckCard} expanded />
        </MoveAnimationContext.Provider>
      </CacheContext.Provider>
    </DndProvider>
  );
}
