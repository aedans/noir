import React from "react";
import { Container } from "@pixi/react";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { useLocation } from "wouter";
import { auth, serverOrigin } from "../cards.js";
import { hasWon } from "../wins.js";

export default function Menu() {
  const [_, setLocation] = useLocation();

  if (!hasWon("Tutorial 1")) {
    setLocation("/queue/Tutorial 1/");
  }

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
      <Button
        text="Tutorial"
        y={600}
        pointerdown={() => {
          setLocation("/queue/Tutorial 1/");
        }}
      />
      <Button
        text={auth.token == null ? "Login" : "Logout"}
        y={800}
        pointerdown={() => {
          const endpoint = auth.token == null ? "login" : "logout";
          window.location.href = `${serverOrigin}/${endpoint}?returnTo=${window.location.host}`;
        }}
      />
    </Container>
  );
}
