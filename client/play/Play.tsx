import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import React from "react";
import { useLocation } from "wouter";
import Button from "../Button";

export default function Play() {
  const [_, setLocation] = useLocation();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 100}>
      <Button
        text="Solo"
        pointerdown={() => {
          setLocation("/solo/");
        }}
        />
      <Button
        text="Casual"
        y={200}
        pointerdown={() => {
          setLocation("/enqueue/casual");
        }}
      />
    </Container>
  );
}
