import React, { ReactNode } from "react";
import { useLocation } from "wouter";
import Button from "../Button";
import { Container } from "react-pixi-fiber";
import { useClientSelector } from "../store";
import { targetResolution } from "../Camera";

export default function Decks() {
  const decks = useClientSelector((game) => game.decks);
  const [_, setLocation] = useLocation();

  let y = 0;
  let buttons: ReactNode[] = [];
  for (const name of Object.keys(decks)) {
    buttons.push(
      <Button
        text={name}
        key={name}
        y={y}
        pointerdown={() => {
          setLocation(`/edit/${name}`);
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
