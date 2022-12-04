import React from "react";
import { Container } from "react-pixi-fiber";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2}>
      <Button
        text="Play"
        pointerdown={() => {
          navigate("/play");
        }}
      />
      <Button
        text="Decks"
        y={200}
        pointerdown={() => {
          navigate("/decks");
        }}
      />
    </Container>
  );
}
