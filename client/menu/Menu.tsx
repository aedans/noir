import React from "react";
import { Container } from "react-pixi-fiber";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { useLocation } from "wouter";

export default function Menu() {
  const [_, setLocation] = useLocation();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2}>
      <Button
        text="Play"
        pointerdown={() => {
          setLocation("/enqueue/casual");
        }}
      />
      <Button
        text="DaphrilBot9000"
        y={200}
        pointerdown={() => {
          setLocation("/enqueue/daphril");
        }}
      />
      <Button
        text="Decks"
        y={400}
        pointerdown={() => {
          setLocation("/decks/");
        }}
      />
      <Button
        text="Replays"
        y={600}
        pointerdown={() => {
          setLocation("/replays/");
        }}
      />
    </Container>
  );
}
