import React from "react";
import { ReactNode } from "react";
import { useClientSelector } from "../store.js";
import Button from "../Button.js";
import { useLocation } from "wouter";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera.js";

export default function Enqueue(props: { params: { queue: string } }) {
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
          setLocation(`/queue/${props.params.queue}/${name}/`);
        }}
      />
    );

    y += 200;
  }

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 400}>
      {buttons}
    </Container>
  );
}
