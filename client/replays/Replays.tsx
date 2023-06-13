import React, { useEffect, useState } from "react";
import { Container } from "react-pixi-fiber";
import { useLocation } from "wouter";
import { targetResolution } from "../Camera";
import { serverOrigin } from "../cards";
import Button from "../Button";
import { WithId } from "mongodb";
import { Replay } from "../../server/db/replay";
import { opponentOf } from "../../common/gameSlice";

export default function Replays() {
  const [_, setLocation] = useLocation();
  const [replays, setReplays] = useState([] as WithId<Replay & { timestamp: string }>[]);

  useEffect(() => {
    fetch(`${serverOrigin}/api/replays`)
      .then((x) => x.json())
      .then(setReplays);
  }, []);

  const gameButtons = replays.map((game, index) => {
    const date = new Date(game.timestamp);
    const players = `${game.names[game.winner]} defeats ${game.names[opponentOf(game.winner)]}`;
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

  return (
    <Container x={targetResolution.width / 2} y={150}>
      {gameButtons}
    </Container>
  );
}
