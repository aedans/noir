import React from "react";
import { Container } from "react-pixi-fiber";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { useLocation } from "wouter";

export default function Menu() {
  const [_, setLocation] = useLocation();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 500}>
      <Button
        text="Play"
        pointerdown={() => {
          setLocation("/enqueue/casual");
        }}
      />
      <Button
        text="Daphril the Daunted"
        y={200}
        pointerdown={() => {
          setLocation("/enqueue/daphril1");
        }}
      />
      <Button
        text="Daphril the Dauntless"
        y={400}
        pointerdown={() => {
          setLocation("/enqueue/daphril2");
        }}
      />
      <Button
        text="DaphrilBot9000"
        y={600}
        pointerdown={() => {
          setLocation("/enqueue/daphril3");
        }}
      />
      <Button
        text="Decks"
        y={800}
        pointerdown={() => {
          setLocation("/decks/");
        }}
      />
      <Button
        text="Replays"
        y={1000}
        pointerdown={() => {
          setLocation("/replays/");
        }}
      />
    </Container>
  );
}
