import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Container, useApp } from "@pixi/react";
import Board from "./Board.js";
import EndTurn from "./EndTurn.js";
import { MoveAnimationContext, MoveAnimationState } from "../animation.js";
import { PlayerId } from "../../common/gameSlice.js";
import Resources from "./Resources.js";
import OpponentBoard from "./OpponentBoard.js";
import OpponentHand from "./OpponentHand.js";
import Message from "./Message.js";
import Grave from "./Grave.js";
import { CardCosmetic, CardState, CardStateInfo, Target } from "../../common/card.js";
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
import { DndProvider } from "react-dnd";
import PIXIBackend from "../PIXIBackend.js";
import Plan from "./Plan.js";

export const PlayerContext = React.createContext(0 as PlayerId);
export const CacheContext = React.createContext(new RemoteCardInfoCache() as CardInfoCache);
export const CosmeticContext = React.createContext({} as { [id: string]: CardCosmetic });
export const ConnectionContext = React.createContext(
  {} as {
    turn: (_: PlayerAction[]) => void;
    concede: () => void;
  }
);

export type CostDisplay = {
  exhausted: Target[];
  prepared: Target[];
};

export const HelpContext = React.createContext(
  {} as {
    help: null | CardState;
    setHelp: Dispatch<SetStateAction<null | CardState>>;
  }
);

export const CostDisplayContext = React.createContext(
  {} as {
    costDisplay: CostDisplay;
    setCostDisplay: Dispatch<SetStateAction<CostDisplay>>;
  }
);

export const HighlightContext = React.createContext(
  {} as {
    highlight: Target[];
    setHighlight: Dispatch<SetStateAction<Target[]>>;
  }
);

export type PlanProps = { type: "play" | "activate", action: PlayerAction; card: CardState };

export const PlanContext = React.createContext(
  {} as {
    plan: PlanProps[];
    setPlan: Dispatch<SetStateAction<PlanProps[]>>;
  }
);

export default function Game(props: { message: string }) {
  const app = useApp();
  const cache = useRef(new RemoteCardInfoCache() as CardInfoCache);
  const game = useClientSelector((state) => state.game);
  const cards = useRef({} as { [id: string]: MoveAnimationState });
  const timeColorFilterRef = useTimeColorFilter();
  const [help, setHelp] = useState(null as CardState | null);
  const [costDisplay, setCostDisplay] = useState({ exhausted: [], prepared: [] } as CostDisplay);
  const [highlight, setHighlight] = useState([] as Target[]);
  const [plan, setPlan] = useState([] as PlanProps[]);

  useEffect(() => {
    cache.current.reset();
    setCostDisplay(({ exhausted }) => ({
      exhausted: exhausted,
      prepared: [],
    }));
  }, [game]);

  return (
    <DndProvider backend={PIXIBackend(app)}>
      <HelpContext.Provider value={{ help, setHelp }}>
        <CacheContext.Provider value={cache.current}>
          <CostDisplayContext.Provider value={{ costDisplay, setCostDisplay }}>
            <MoveAnimationContext.Provider value={cards}>
              <HighlightContext.Provider value={{ highlight, setHighlight }}>
                <PlanContext.Provider value={{ plan, setPlan }}>
                  <Container filters={[timeColorFilterRef.current]} sortableChildren>
                    <Table />
                    <OpponentBoard />
                    <Board />
                    <EndTurn />
                    <OpponentGrave />
                    <Grave />
                    <Plan />
                    <OpponentHand />
                    <HandAndDeck />
                    <Resources />
                    <Concede />
                    <Explanations />
                    <Message text={props.message} />
                  </Container>
                </PlanContext.Provider>
              </HighlightContext.Provider>
            </MoveAnimationContext.Provider>
          </CostDisplayContext.Provider>
        </CacheContext.Provider>
      </HelpContext.Provider>
    </DndProvider>
  );
}
