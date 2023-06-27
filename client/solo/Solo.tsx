import React from "react";
import { useState } from "react";
import { Container } from "@pixi/react";
import { useLocation } from "wouter";
import { Difficulty, MissionName } from "../../server/Mission.js";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { hasWon } from "../wins.js";
import { CardColors } from "../../common/card.js";
import { hex } from "../color.js";

type MissionButtonProps = {
  mission: MissionName;
  difficulty: Difficulty;
  y: number;
  color: CardColors;
};

function MissionButton(props: MissionButtonProps) {
  const [_, setLocation] = useLocation();
  const name = `${props.mission} level ${props.difficulty}`;
  const wonRandomCitizens = hasWon("Random Citizens level 1") || props.mission == "Random Citizens";
  const wonBase = props.difficulty == 1 || hasWon(`${props.mission} level 1`);

  return (
    <Button
      text={props.mission}
      y={props.y}
      style={{ tint: wonRandomCitizens && wonBase ? hex[props.color] : 0x383838 }}
      pointerdown={() => {
        if (!wonRandomCitizens) {
          alert("Defeat Random Citizens to play other missions");
        } else if (!wonBase) {
          alert(`Defeat ${props.mission} on Normal to unlock Heroic ${props.mission}`);
        } else {
          setLocation(`/enqueue/${name}`);
        }
      }}
    />
  );
}

export default function Solo() {
  const [difficulty, setDifficulty] = useState(1 as Difficulty);

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 500}>
      <Button
        text={"Difficulty: " + (difficulty == 1 ? "Normal" : "Heroic")}
        pointerdown={() => {
          setDifficulty(difficulty == 1 ? 2 : 1);
        }}
      />
      <MissionButton mission="Random Citizens" difficulty={difficulty} y={400} color="colorless" />
      <MissionButton mission="Civic Proceedings" difficulty={difficulty} y={600} color="blue" />
      <MissionButton mission="Industrial Design" difficulty={difficulty} y={800} color="green" />
      <MissionButton mission="Strength in Numbers" difficulty={difficulty} y={1000} color="orange" />
      <MissionButton mission="Underhanded Dealings" difficulty={difficulty} y={1200} color="purple" />
      <MissionButton mission="Daphril the Dauntless" difficulty={difficulty} y={1400} color="colorless" />
    </Container>
  );
}
