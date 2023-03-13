import { WithId } from "mongodb";
import React, { useEffect, useState } from "react";
import { GameAction } from "../../common/gameSlice";
import { liftAction, reset } from "../../common/historySlice";
import { loadCardsFromAction, serverOrigin } from "../cards";
import Game, { ConnectionContext, PlayerContext } from "../game/Game";
import { useClientDispatch } from "../store";

export default function Replay(props: { params: { id: string } }) {
  const [replay, setReplay] = useState(null as WithId<{ history: GameAction[] }> | null);
  const dispatch = useClientDispatch();

  useEffect(() => {
    (async () => {
      const res = await fetch(`${serverOrigin}/api/replays/${props.params.id}`);
      const replay = (await res.json()) as WithId<{ history: GameAction[] }>;

      let index = 0;
      for (const action of replay.history) {
        await loadCardsFromAction(action);
        dispatch(liftAction(index++, action));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setReplay(replay);
    })();

    return () => {
      dispatch(reset());
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ emit: () => {}, concede: () => {} }}>
      <PlayerContext.Provider value={1}>
        <Game message={replay == null ? "Loading Replay" : "Loaded Replay"} />
      </PlayerContext.Provider>
    </ConnectionContext.Provider>
  );
}
