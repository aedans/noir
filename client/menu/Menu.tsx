import React, { useEffect, useState } from "react";
import { Container } from "@pixi/react";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { useLocation } from "wouter";
import { serverOrigin, trpc } from "../cards.js";

export default function Menu() {
  const [_, setLocation] = useLocation();
  const [auth, setAuth] = useState(null as any);

  useEffect(() => {
    trpc.auth.query().then((auth) => setAuth(auth));
  }, []);

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
        text={auth == null ? "Login" : "Logout"}
        y={600}
        pointerdown={() => {
          const endpoint = auth == null ? "login" : "logout";
          window.location.href = `${serverOrigin}/${endpoint}?returnTo=${window.location.host}`;
        }}
      />
    </Container>
  );
}
