import React, { useEffect, useState } from "react";
import { Container } from "@pixi/react";
import { useLocation } from "wouter";
import { targetResolution } from "../Camera.js";
import { serverOrigin } from "../cards.js";
import Button from "../Button.js";
import { WithId } from "mongodb";
import { Replay } from "../../server/db/replay.js";
import { opponentOf } from "../../common/gameSlice.js";

export default function Replays() {
  const [_, setLocation] = useLocation();
  const [fetchReplays, setFetchReplays] = useState(true);
  const [end, setEnd] = useState(false);
  const [replays, setReplays] = useState([] as WithId<Replay & { timestamp: string }>[]);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const replaysRequired = (-scroll + 2000) / 150 + 1;
    if (!end && replaysRequired > replays.length) {
      setFetchReplays(true);
    }
  }, [scroll, end]);

  useEffect(() => {
    if (fetchReplays) {
      fetch(`${serverOrigin}/api/replays?skip=${replays.length}`)
        .then((x) => x.json())
        .then((replays) => {
          setReplays((rs) => [...rs, ...replays]);
          setFetchReplays(false);
          if (replays.length < 20) {
            setEnd(true);
          }
        });
    }
  }, [fetchReplays]);

  useEffect(() => {
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

  const gameButtons = replays.map((game, index) => {
    const date = new Date(game.timestamp);
    const players =
      game.winner == "draw"
        ? `${game.names[0]} draws against ${game.names[1]}`
        : `${game.names[game.winner]} defeats ${game.names[opponentOf(game.winner)]}`;
    const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const text = `${players} at ${time}`;
    return (
      <Button
        key={game._id.toString()}
        y={index * 150}
        text={text}
        pointerdown={() => setLocation(`/replays/${game._id}`)}
      />
    );
  });

  const terminator = end ? <Button text="END" y={(replays.length + 1) * 150} /> : null;

  return (
    <Container x={targetResolution.width / 2} y={scroll + 150}>
      {gameButtons}
      {terminator}
    </Container>
  );
}
