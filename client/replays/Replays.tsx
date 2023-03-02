import React, { useEffect, useState } from "react";
import { Container } from "react-pixi-fiber";
import { useLocation } from "wouter";
import { targetResolution } from "../Camera";
import { serverOrigin } from "../cards";
import Button from "../Button";
import { WithId } from "mongodb";

export default function Replays() {
  const [_, setLocation] = useLocation();
  const [replays, setReplays] = useState([] as WithId<{}>[]);

  useEffect(() => {
    fetch(`${serverOrigin}/replays`)
      .then((x) => x.json())
      .then(setReplays);
  }, []);

  const gameButtons = replays.map((game) => (
    <Button key={game._id.toString()} text={game._id} pointerdown={() => setLocation(`/replays/${game._id}`)} />
  ));

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2}>
      {gameButtons}
    </Container>
  );
}
