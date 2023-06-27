import React from "react";
import { Container } from "@pixi/react";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { useLocation } from "wouter";

export default function Menu() {
  const [_, setLocation] = useLocation();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 200}>
      <Button
        text="Play"
        pointerdown={() => {
          setLocation("/play/");
        }}
      />
      <Button
        text="Decks"
        y={200}
        pointerdown={() => {
          setLocation("/decks/");
        }}
      />
      <Button
        text="Replays"
        y={400}
        pointerdown={() => {
          setLocation("/replays/");
        }}
      />
    </Container>
  );
}
