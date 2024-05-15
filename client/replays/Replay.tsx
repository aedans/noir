import { WithId } from "mongodb";
import React, { useEffect, useState } from "react";
import { GameAction, isPlayerAction, reset } from "../../common/gameSlice.js";
import { loadCardsFromAction, trpc } from "../cards.js";
import Game, { ConnectionContext, PlayerContext } from "../game/Game.js";
import { useClientDispatch } from "../store.js";

export default function Replay(props: { params: { id: string } }) {
  const [replay, setReplay] = useState(null as WithId<{ history: GameAction[] }> | null);
  const dispatch = useClientDispatch();

  useEffect(() => {
    let stop = false;

    (async () => {
      const replay = await trpc.replay.query({ id: props.params.id });
      if (!replay) {
        return;
      }

      let history = replay.history.filter((x) => (x.type as any) != "game/protectCard");

      while (history.length > 0) {
        const nextIndex = history.slice(1).findIndex((action) => isPlayerAction(action)) + 1;
        const length = nextIndex <= 0 ? history.length : nextIndex;
        const actions = history.slice(0, length);
        history = history.slice(actions.length);

        for (const action of actions) {
          await loadCardsFromAction(action);
          dispatch(action);

          if (action.type == "game/playCard" || action.type == "game/activateCard") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (stop) {
          return;
        }
      }

      setReplay(replay);
    })();

    return () => {
      stop = true;
      dispatch(reset({ source: undefined }));
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ emit: () => {}, concede: () => {} }}>
      <PlayerContext.Provider value={0}>
        <Game message={replay == null ? "Loading Replay" : "Loaded Replay"} />
      </PlayerContext.Provider>
    </ConnectionContext.Provider>
  );
}
