import React from "react";
import { Container } from "@pixi/react";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { useLocation } from "wouter";
import { auth, serverOrigin } from "../cards.js";
import { hasWon } from "../wins.js";

export default function Menu() {
  const [_, setLocation] = useLocation();

  if (!hasWon("Tutorial")) {
    setLocation("/queue/Tutorial/");
  }

  let y = -400;

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 200}>
      <Button
        text="Play"
        y={(y += 200)}
        pointerdown={() => {
          setLocation("/play/");
        }}
      />
      <Button
        text="Decks"
        y={(y += 200)}
        pointerdown={() => {
          setLocation("/decks/");
        }}
      />
      <Button
        text={auth.token == null ? "Login" : "Logout"}
        y={(y += 200)}
        pointerdown={() => {
          const endpoint = auth.token == null ? "login" : "logout";
          window.location.href = `${serverOrigin}/${endpoint}?returnTo=${window.location.host}`;
        }}
      />
      <Button
        text="Replays"
        y={(y += 200)}
        pointerdown={() => {
          setLocation("/replays/");
        }}
      />
      <Button
        text="Tutorial"
        y={(y += 200)}
        pointerdown={() => {
          setLocation("/queue/Tutorial/");
        }}
      />
      <Button
        text="Storybook"
        y={(y += 200)}
        pointerdown={() => {
          window.location.href = "https://aedans.github.io/noir/";
        }}
      ></Button>
    </Container>
  );
}
