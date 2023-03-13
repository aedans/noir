import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import EndTurn from "./EndTurn";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import { PlayerId } from "../../common/gameSlice";
import Resources from "./Resources";
import OpponentBoard from "./OpponentBoard";
import OpponentHand from "./OpponentHand";
import Message from "./Message";
import Grave from "./Grave";
import { Target } from "../../common/card";
import HandAndDeck from "./HandAndDeck";
import OpponentGrave from "./OpponentGrave";
import { PlayerAction } from "../../common/network";
import { useClientSelector } from "../store";
import Concede from "./Concede";

export const PlayerContext = React.createContext(0 as PlayerId);
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

export default function Game(props: { message: string }) {
  const [hover, setHover] = useState([] as Target[]);
  const [prepared, setPrepared] = useState([] as Target[]);
  const game = useClientSelector((state) => state.game);
  const cards = useRef({} as MoveAnimationState);

  useEffect(() => {
    setPrepared([]);
  }, [game]);

  return (
    <MoveAnimationContext.Provider value={cards}>
      <HoverContext.Provider value={{ hover, setHover }}>
        <PreparedContext.Provider value={{ prepared, setPrepared }}>
          <Container>
            <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
            <OpponentHand />
            <OpponentBoard />
            <Board />
            <EndTurn />
            <Resources />
            <Concede />
            <HandAndDeck />
            <OpponentGrave />
            <Grave />
            <Message text={props.message} />
          </Container>
        </PreparedContext.Provider>
      </HoverContext.Provider>
    </MoveAnimationContext.Provider>
  );
}
