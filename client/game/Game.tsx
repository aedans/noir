import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board.js";
import EndTurn from "./EndTurn.js";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation.js";
import { PlayerId } from "../../common/gameSlice.js";
import Resources from "./Resources.js";
import OpponentBoard from "./OpponentBoard.js";
import OpponentHand from "./OpponentHand.js";
import Message from "./Message.js";
import Grave from "./Grave.js";
import { Target } from "../../common/card.js";
import HandAndDeck from "./HandAndDeck.js";
import OpponentGrave from "./OpponentGrave.js";
import { PlayerAction } from "../../common/network.js";
import { useClientSelector } from "../store.js";
import Concede from "./Concede.js";
import { useTimeColorFilter } from "../time.js";
import Explanations from "./Explanations.js";
import Table from "./Table.js";
import CardInfoCache from "../../common/CardInfoCache.js";
import RemoteCardInfoCache from "../cards.js";

export const PlayerContext = React.createContext(0 as PlayerId);
export const CacheContext = React.createContext(new RemoteCardInfoCache() as CardInfoCache);
export const ConnectionContext = React.createContext({
  emit: (_: PlayerAction) => {},
  concede: () => {},
});

export const HoverContext = React.createContext(
  {} as {
    hover: Target[];
    setHover: Dispatch<SetStateAction<Target[]>>;
  }
);

export const PreparedContext = React.createContext(
  {} as {
    prepared: Target[];
    setPrepared: Dispatch<SetStateAction<Target[]>>;
  }
);

export const HighlightContext = React.createContext(
  {} as {
    highlight: Target[];
    setHighlight: Dispatch<SetStateAction<Target[]>>;
  }
);

export default function Game(props: { message: string }) {
  const cache = useRef(new RemoteCardInfoCache() as CardInfoCache);
  const [hover, setHover] = useState([] as Target[]);
  const [prepared, setPrepared] = useState([] as Target[]);
  const [highlight, setHighlight] = useState([] as Target[]);
  const game = useClientSelector((state) => state.game.current);
  const cards = useRef({} as MoveAnimationState);
  const timeColorFilterRef = useTimeColorFilter();

  useEffect(() => {
    setPrepared([]);
    cache.current.reset();
  }, [game]);

  return (
    <CacheContext.Provider value={cache.current}>
      <MoveAnimationContext.Provider value={cards}>
        <HoverContext.Provider value={{ hover, setHover }}>
          <PreparedContext.Provider value={{ prepared, setPrepared }}>
            <HighlightContext.Provider value={{ highlight, setHighlight }}>
              <Container filters={[timeColorFilterRef.current]}>
                <Explanations />
                <Table/>
                <OpponentBoard />
                <Board />
                <EndTurn />
                <Resources />
                <Concede />
                <OpponentGrave />
                <Grave />
                <OpponentHand />
                <HandAndDeck />
                <Message text={props.message} />
              </Container>
            </HighlightContext.Provider>
          </PreparedContext.Provider>
        </HoverContext.Provider>
      </MoveAnimationContext.Provider>
    </CacheContext.Provider>
  );
}
