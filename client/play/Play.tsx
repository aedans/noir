import React from "react";
import { ReactNode } from "react";
import { useClientSelector } from "../store";
import Button from "../Button";
import { useLocation } from "wouter";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";

export default function Play() {
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
          setLocation(`/game/${name}`);
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
