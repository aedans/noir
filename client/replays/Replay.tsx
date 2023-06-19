import { WithId } from "mongodb";
import React, { useEffect, useState } from "react";
import { GameAction, isPlayerAction } from "../../common/gameSlice";
import { batch, liftAction, reset } from "../../common/historySlice";
import { loadCardsFromAction, serverOrigin } from "../cards";
import Game, { ConnectionContext, PlayerContext } from "../game/Game";
import { useClientDispatch } from "../store";

export default function Replay(props: { params: { id: string } }) {
  const [replay, setReplay] = useState(null as WithId<{ history: GameAction[] }> | null);
  const dispatch = useClientDispatch();

  useEffect(() => {
    let stop = false;

    (async () => {
      const res = await fetch(`${serverOrigin}/api/replays/${props.params.id}`);
      const replay = (await res.json()) as WithId<{ history: GameAction[] }>;
      let history = replay.history.filter((x) => (x.type as any) != "game/protectCard");

      let index = 0;
      while (history.length > 0) {
        const nextIndex = history.slice(1).findIndex((action) => isPlayerAction(action)) + 1;
        const length = nextIndex <= 0 ? history.length : nextIndex;
        const actions = history.slice(0, length);
        history = history.slice(actions.length);

        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        if (stop) {
          return;
        }

        dispatch(batch({ actions: actions.map((action) => liftAction(index++, action)) }));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setReplay(replay);
    })();

    return () => {
      stop = true;
      dispatch(reset());
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
