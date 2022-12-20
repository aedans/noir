import React, { ReactNode } from "react";
import Button from "../Button";
import { Container } from "react-pixi-fiber";
import { useNavigate } from "react-router-dom";
import { useClientSelector } from "../store";
import { targetResolution } from "../Camera";

export default function Decks() {
  const decks = useClientSelector((game) => game.decks);
  const navigate = useNavigate();

  let y = 0;
  let buttons: ReactNode[] = [];
  for (const name of Object.keys(decks)) {
    buttons.push(
      <Button
        text={name}
        key={name}
        y={y}
        pointerdown={() => {
          navigate(`/edit?deck=${name}`);
        }}
      />
    );

    y += 200;
  }

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2}>
      {buttons}
    </Container>
  );
}
