import { WithId } from "mongodb";
import React, { useEffect, useState } from "react";
import { GameAction } from "../../common/gameSlice";
import { liftAction, reset } from "../../common/historySlice";
import { loadCardsFromAction, serverOrigin } from "../cards";
import Game, { ConnectionContext, PlayerContext } from "../game/Game";
import { useClientDispatch } from "../store";
import { takeWhile } from "lodash";
import { batchActions } from "redux-batched-actions";

export default function Replay(props: { params: { id: string } }) {
  const [replay, setReplay] = useState(null as WithId<{ history: GameAction[] }> | null);
  const dispatch = useClientDispatch();

  useEffect(() => {
    (async () => {
      const res = await fetch(`${serverOrigin}/api/replays/${props.params.id}`);
      const replay = (await res.json()) as WithId<{ history: GameAction[] }>;
      let history = replay.history;

      let index = 0;
      while (history.length > 0) {
        const nextIndex = history.findIndex((x) => x.type == "game/endTurn" || x.type == "game/playCard");
        const length = nextIndex < 0 ? history.length : 0;
        const actions = history.slice(0, length + 1);
        history = history.slice(actions.length);

        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        dispatch(batchActions(actions.map((action) => liftAction(index++, action))));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setReplay(replay);
    })();

    return () => {
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
