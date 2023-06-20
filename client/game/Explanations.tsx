import { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Explanation, explain, isExplained, setExplained } from "../explain";
import { useClientSelector } from "../store";
import { CacheContext, HighlightContext, PlayerContext } from "./Game";
import React from "react";
import Rectangle from "../Rectangle";
import { Container } from "react-pixi-fiber";
import Text from "../Text";
import { targetResolution } from "../Camera";
import anime from "animejs";

export type ExplanationProps = {
  explanation: Explanation;
  setExplanations: Dispatch<SetStateAction<Explanation[]>>;
};

export const explanationFontSize = 56;
export const explanationMargin = 50;
export const explanationBorder = 10;
export const explanationWidth = 1000;
export const explanationHeight = explanationFontSize * 2 + explanationMargin * 2;

export function ExplanationPopup(props: ExplanationProps) {
  const ref = useRef() as MutableRefObject<Required<Container>>;
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const { setHighlight } = useContext(HighlightContext);
  const game = useClientSelector((state) => state.game.current);
  const relevantCards = props.explanation.relevantCards(cache, game, player);

  useEffect(() => {
    anime({
      targets: ref.current,
      duration: 300,
      easing: "linear",
      alpha: 1,
    });
  }, [props.explanation.id]);

  function pointerover() {
    setHighlight((hs) => [...hs, ...relevantCards.filter((c) => !hs.find((h) => h.id == c.id))]);
  }

  function pointerout() {
    setHighlight((hs) => hs.filter((h) => !relevantCards.find((c) => c.id == h.id)));
  }

  function pointerdown() {
    setExplained(props.explanation);
    pointerout();
    anime({
      targets: ref.current,
      duration: 300,
      easing: "linear",
      alpha: 0,
      complete: () => {
        props.setExplanations((es) => es.filter((e) => e.id != props.explanation.id));
      },
    });
  }

  return (
    <Container
      pointerover={pointerover}
      pointerout={pointerout}
      pointerdown={pointerdown}
      interactive
      ref={ref}
      alpha={0}
    >
      <Rectangle width={explanationWidth} height={explanationHeight} fill={0} />
      <Rectangle
        x={explanationBorder}
        y={explanationBorder}
        width={explanationWidth - explanationBorder * 2}
        height={explanationHeight - explanationBorder * 2}
        fill={0xffffff}
      />
      <Text
        x={explanationMargin}
        y={explanationMargin}
        text={props.explanation.text}
        style={{ fontSize: explanationFontSize, tint: 0, maxWidth: explanationWidth - explanationMargin * 2 }}
      />
    </Container>
  );
}

export default function Explanations() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game);
  const [explanations, setExplanations] = useState([] as Explanation[]);

  useEffect(() => {
    const newExplanations = explain(cache, game.current, player).filter((e) => !isExplained(e));
    setExplanations((es) => [...es, ...newExplanations.filter((e1) => !es.find((e2) => e1.text == e2.text))]);
  }, [game]);

  const explanation =
    explanations.length > 0 ? (
      <ExplanationPopup explanation={explanations[0]} setExplanations={setExplanations} />
    ) : null;

  return (
    <Container x={targetResolution.width - explanationWidth} zIndex={10000}>
      {explanation}
    </Container>
  );
}
