import React, { useState } from "react";
import { Container } from "react-pixi-fiber";
import { useLocation } from "wouter";
import { Difficulty, MissionName } from "../../server/Mission";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { hasWon } from "../wins";
import { GlowFilter } from "@pixi/filter-glow";
import { CardColors } from "../../common/card";
import { hex } from "../color";

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
  const glow = new GlowFilter({ color: hex[props.color], outerStrength: 2, quality: 1 });

  return (
    <Button
      text={props.mission}
      y={props.y}
      style={{ tint: wonRandomCitizens && wonBase ? 0xffffff : 0x767676 }}
      filters={wonRandomCitizens && wonBase ? [glow] : []}
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
      <MissionButton mission="Daphril the Dauntless" difficulty={difficulty} y={600} color="colorless" />
      <MissionButton mission="Civic Proceedings" difficulty={difficulty} y={800} color="blue" />
      <MissionButton mission="Industrial Design" difficulty={difficulty} y={1000} color="green" />
      <MissionButton mission="Strength in Numbers" difficulty={difficulty} y={1200} color="orange" />
      <MissionButton mission="Underhanded Dealings" difficulty={difficulty} y={1400} color="purple" />
    </Container>
  );
}
