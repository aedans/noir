import React, { useState } from "react";
import { Container } from "react-pixi-fiber";
import { useLocation } from "wouter";
import { Difficulty, MissionName } from "../../server/Mission";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { hasWon } from "../wins";

function MissionButton(props: { mission: MissionName; difficulty: Difficulty; y: number }) {
  const [_, setLocation] = useLocation();
  const name = `${props.mission} level ${props.difficulty}`;
  const canPlay = props.difficulty == 1 || hasWon(`${props.mission} level 1`);

  return (
    <Button
      text={props.mission}
      y={props.y}
      style={{ tint: canPlay ? 0xffffff : 0x767676 }}
      pointerdown={() => {
        if (canPlay) {
          setLocation(`/enqueue/${name}`);
        } else {
          alert(`Defeat ${props.mission} on Normal to unlock Heroic`);
        }
      }}
    />
  );
}

export default function Solo() {
  const [difficulty, setDifficulty] = useState(1 as Difficulty);

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 300}>
      <Button
        text={"Difficulty: " + (difficulty == 1 ? "Normal" : "Heroic")}
        pointerdown={() => {
          setDifficulty(difficulty == 1 ? 2 : 1);
        }}
      />
      <MissionButton mission="Random Citizens" difficulty={difficulty} y={400} />
      <MissionButton mission="Daphril the Dauntless" difficulty={difficulty} y={600} />
    </Container>
  );
}
