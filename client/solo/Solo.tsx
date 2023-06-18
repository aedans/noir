import React, { useState } from "react";
import { Container } from "react-pixi-fiber";
import { useLocation } from "wouter";
import { Difficulty } from "../../server/Mission";
import Button from "../Button";
import { targetResolution } from "../Camera";

export default function Play() {
  const [_, setLocation] = useLocation();
  const [difficulty, setDifficulty] = useState(1 as Difficulty);

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 300}>
      <Button
        text={"Difficulty: " + (difficulty == 1 ? "Normal" : "Heroic")}
        pointerdown={() => {
          setDifficulty(difficulty == 1 ? 2 : 1);
        }}
      />
      <Button
        text="Random Citizens"
        y={400}
        pointerdown={() => {
          setLocation(`/enqueue/randomCitizens${difficulty}`);
        }}
      />
      <Button
        text="Daphril the Dauntless"
        y={600}
        pointerdown={() => {
          setLocation(`/enqueue/daphril${difficulty}`);
        }}
      />
    </Container>
  );
}
