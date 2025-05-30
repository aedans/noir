import React, { useLayoutEffect } from "react";
import { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Explanation, explain, isExplained, keywordExplanations, setExplained } from "../explain.js";
import { useClientSelector } from "../store.js";
import { CacheContext, HighlightContext, PlayerContext } from "./Game.js";
import Rectangle from "../Rectangle.js";
import { Container } from "@pixi/react-animated";
import { Spring } from "react-spring";
import Text from "../Text.js";
import { targetResolution } from "../Camera.js";
import anime from "animejs";
import { PixiContainer } from "../pixi.js";
import { CardState } from "../../common/card.js";

export type ExplanationProps = {
  index: number;
  explanation: Explanation;
  setClickExplanations?: Dispatch<SetStateAction<Explanation[]>>;
  help?: CardState | null;
};

export const explanationFontSize = 56;
export const explanationMargin = 50;
export const explanationBorder = 10;
export const explanationWidth = 1000;
export const explanationHeight = explanationFontSize * 2 + explanationMargin * 2;

export function ExplanationPopup(props: ExplanationProps) {
  const ref = useRef() as MutableRefObject<PixiContainer>;
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const { setHighlight } = useContext(HighlightContext);
  const game = useClientSelector((state) => state.game);
  const relevantCards = props.explanation.relevantCards(cache, game, player);
  const allRelevantCards = props.explanation.relevantCards(cache, game, player, true);

  useLayoutEffect(() => {
    ref.current.alpha = 0;
  }, []);

  function animateAlpha(alpha: number, complete: () => void = () => {}) {
    anime({
      targets: ref.current,
      duration: 300,
      easing: "linear",
      alpha,
      complete,
    });
  }

  useEffect(() => {
    animateAlpha(1);
  }, []);

  function pointerover() {
    setHighlight((hs) => [...hs, ...relevantCards.filter((c) => !hs.find((h) => h.id == c.id))]);
  }

  function pointerout() {
    setHighlight((hs) => hs.filter((h) => !relevantCards.find((c) => c.id == h.id)));
  }

  function pointerdown() {
    pointerout();
    animateAlpha(0, () => {
      if (props.setClickExplanations) {
        setExplained(props.explanation);
        props.setClickExplanations((es) => es.filter((e) => e.id != props.explanation.id));
      }
    });
  }

  if (
    typeof props.help != "undefined" &&
    (props.help == null || !allRelevantCards.some((c) => c.id == props.help!.id))
  ) {
    animateAlpha(0);
  }

  if (props.help && allRelevantCards.some((c) => c.id == props.help!.id)) {
    animateAlpha(1);
  }

  return (
    <Spring to={{ y: props.index * (explanationHeight - explanationBorder) }} delay={300}>
      {(p) => (
        <Container
          pointerover={pointerover}
          pointerout={pointerout}
          pointerdown={pointerdown}
          eventMode="static"
          {...p}
          ref={ref}
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
      )}
    </Spring>
  );
}

export default function Explanations() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game);
  const [clickExplanations, setClickExplanations] = useState([] as Explanation[]);

  useEffect(() => {
    const newExplanations = explain(cache, game, player).filter((e) => !isExplained(e));
    setClickExplanations((es) => [...es, ...newExplanations.filter((e1) => !es.find((e2) => e1.text == e2.text))]);
  }, [game]);

  const clicks = clickExplanations.map((e, i) => (
    <ExplanationPopup explanation={e} setClickExplanations={setClickExplanations} index={i} key={`click-${e.id}`} />
  ));

  return (
    <Container x={targetResolution.width - explanationWidth} zIndex={10000}>
      {clicks}
    </Container>
  );
}
