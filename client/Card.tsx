import React, { MutableRefObject, Ref, useEffect, useImperativeHandle, useRef } from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardInfo, CardKeyword, CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { filters, Texture } from "pixi.js";
import { useCardInfo } from "./cards";
import anime from "animejs";
import { GlowFilter } from "@pixi/filter-glow";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export const smallCardScale = 1 / 4;
export const smallCardWidth = cardWidth * smallCardScale;
export const smallCardHeight = cardHeight * smallCardScale;

export function getCardColor(cardInfo: CardInfo) {
  const colorMap = {
    orange: 0xeb6300,
    blue: 0x0087eb,
    green: 0x12eb00,
    purple: 0xd800eb,
    any: 0x767676,
  };

  return colorMap[cardInfo.colors.length == 1 ? cardInfo.colors[0] : "any"];
}

export function getDisplayName(keyword: CardKeyword) {
  const displayNameMap: { [T in CardKeyword]: string } = {
    disloyal: "Disloyal",
    protected: "Protected",
    vip: "VIP",
  };

  return displayNameMap[keyword];
}

export type CardProps = {
  state: CardState;
  shadow?: number;
  shouldGlow?: boolean;
  shouldDimWhenExhausted?: boolean;
};

export function isCardStateEqual(a: CardState, b: CardState) {
  const aKeys = Object.keys(a.props);
  const bKeys = Object.keys(b.props);

  if (aKeys.length != bKeys.length) {
    return false;
  }

  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] != bKeys[i] || a.props[aKeys[i]] != b.props[aKeys[i]]) {
      return false;
    }
  }

  if (a.modifiers.length != b.modifiers.length) {
    return false;
  }

  for (let i = 0; i < a.modifiers.length; i++) {
    if (a.modifiers[i].name != b.modifiers[i].name || a.modifiers[i].card != b.modifiers[i].card) {
      return false;
    }
  }

  return a.hidden == b.hidden && a.exhausted == b.exhausted && a.name == b.name && a.protected == b.protected;
}

export function isCardPropsEqual(a: CardProps, b: CardProps) {
  return (
    isCardStateEqual(a.state, b.state) &&
    a.shadow == b.shadow &&
    a.shouldGlow == b.shouldGlow &&
    a.shouldDimWhenExhausted == b.shouldDimWhenExhausted
  );
}

export default React.memo(
  React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
    const cardInfo = useCardInfo(props.state);
    const containerRef = useRef() as MutableRefObject<Required<Container>>;
    const dimFilterRef = useRef(new filters.ColorMatrixFilter());
    const dropShadowFilterRef = useRef(new DropShadowFilter({ alpha: 0.5, blur: 1, distance: 0 }));
    const glowFilterRef = useRef(new GlowFilter({ outerStrength: 0 }));

    useImperativeHandle(ref, () => containerRef.current);

    useEffect(() => {
      (containerRef.current as any).convertTo3d?.();
      dimFilterRef.current.alpha = 0;
    }, []);

    useEffect(() => {
      if (props.shadow) {
        dropShadowFilterRef.current.distance = props.shadow;
      } else {
        dropShadowFilterRef.current.enabled = false;
      }
    }, [props.shadow]);

    useEffect(() => {
      dimFilterRef.current.greyscale(0, true);
      anime({
        targets: dimFilterRef.current,
        duration: 300,
        easing: "easeOutExpo",
        alpha: props.state.exhausted && props.shouldDimWhenExhausted ? 0.5 : 0,
      });
    }, [props.state.exhausted]);

    useEffect(() => {
      glowFilterRef.current.color = getCardColor(cardInfo);
    }, [cardInfo]);

    useEffect(() => {
      anime({
        targets: glowFilterRef.current,
        duration: 300,
        easing: "easeOutExpo",
        outerStrength: props.shouldGlow ? 4 : 0,
      });
    }, [props.shouldGlow]);

    let text = cardInfo.text;
    let keywords = cardInfo.keywords;

    if (!props.state.protected) {
      keywords = keywords.filter((x) => x != "protected");
    }

    if (keywords.length > 0) {
      text = `${keywords.map(getDisplayName).join(", ")}\n${text}`.trim();
    }

    let propsText = "";
    for (const [name, value] of Object.entries(props.state.props)) {
      if (value != undefined) {
        const upperName = name.charAt(0).toUpperCase() + name.slice(1);
        propsText += `${upperName}: ${value}`;
      }
    }

    if (propsText != "") {
      text = `${text}\n${propsText}`;
    }

    return (
      <Container
        pivot={[cardWidth / 2, cardHeight / 2]}
        filters={[glowFilterRef.current, dimFilterRef.current, dropShadowFilterRef.current]}
        ref={containerRef}
      >
        <Rectangle fill={getCardColor(cardInfo)} width={cardWidth - 100} height={cardHeight - 100} x={50} y={50} />
        <Sprite texture={Texture.from("/border.png")} />
        <Text
          anchor={[0.5, 0]}
          x={cardWidth / 2 + 100}
          y={110}
          text={props.state.name}
          style={{ fontSize: 128, tint: 0 }}
        />
        <Text
          anchor={[0.5, 0.5]}
          x={cardWidth / 2}
          y={cardHeight * (3 / 4) + 50}
          text={text}
          style={{ fontSize: 128, align: "center", maxWidth: cardWidth - 200, letterSpacing: 1 }}
        />
        <Text
          anchor={[0.5, 0.5]}
          x={160}
          y={170}
          text={Math.max(0, cardInfo.cost.money)}
          style={{ fontSize: 128, tint: 0 }}
        />
        <Text
          anchor={[0.5, 0.5]}
          x={160}
          y={340}
          text={Math.max(0, cardInfo.cost.agents) || ""}
          style={{ fontSize: 128, tint: getCardColor(cardInfo) }}
        />
      </Container>
    );
  }),
  isCardPropsEqual
);
