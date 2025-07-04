import React, { MutableRefObject, Ref, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Container, Sprite, useApp } from "@pixi/react";
import Rectangle, { RectangleProps } from "./Rectangle.js";
import { targetResolution } from "./Camera.js";
import { CardColors, CardCosmetic, CardCost, CardInfo, CardState, ModifierState } from "../common/card.js";
import Text from "./Text.js";
import {
  Graphics,
  filters as PixiFilters,
  RenderTexture,
  Texture,
  PixiContainer,
  PixiSprite,
  MIPMAP_MODES,
} from "./pixi.js";
import anime from "animejs";
import { GlowFilter } from "@pixi/filter-glow";
import { colorlessColor, getColor, getRGB, hex } from "./color.js";
import WindFilter from "./WindFilter.js";
import { CardKeyword } from "../common/keywords.js";
import moize from "moize";

export const cardHeight = targetResolution.height / 4;
export const cardWidth = cardHeight * (1 / 1.4);

export function combineColors(colors: CardColors[]) {
  return colors.reduce((a, b) => {
    if (a == "colorless") {
      return b;
    } else if (b == "colorless") {
      return a;
    } else if (a == b) {
      return a;
    } else {
      return "multicolor";
    }
  }, "colorless");
}

export function combineKeywords(a: CardKeyword, b: CardKeyword): CardKeyword {
  if (a[0] == "delay" && b[0] == "delay") {
    return ["delay", a[1] + b[1]];
  } else if (a[0] == "debt" && b[0] == "debt") {
    return ["debt", a[1] + b[1]];
  } else if (a[0] == "depart" && b[0] == "depart") {
    return ["depart", a[1] + b[1]];
  } else {
    return a;
  }
}

export function collapseKeywords(keywords: CardKeyword[]) {
  const newKeywords: CardKeyword[] = [];
  for (const keyword of keywords) {
    const keywordIndex = newKeywords.findIndex((k) => k[0] == keyword[0]);
    if (keywordIndex == -1) {
      newKeywords.push(keyword);
    } else {
      newKeywords[keywordIndex] = combineKeywords(keyword, newKeywords[keywordIndex]);
    }
  }

  return newKeywords;
}

export function getDisplayName(keyword: CardKeyword) {
  const displayNameMap: { [T in CardKeyword[0]]: string } = {
    disloyal: "Disloyal",
    protected: "Protected",
    vip: "VIP",
    delay: "Delay",
    debt: "Debt",
    depart: "Depart",
    tribute: "Tribute",
  };

  let string = displayNameMap[keyword[0]];
  for (const value of keyword.slice(1)) {
    string += ` ${value}`;
  }

  return string;
}

export type CardProps = {
  state: CardState;
  info: CardInfo;
  cosmetic?: CardCosmetic;
  shouldGlow?: boolean;
  shouldDimWhenExhausted?: boolean;
  borderTint?: number;
};

export function isModifierEqual(a: ModifierState, b: ModifierState) {
  return a.card.id == b.card.id && a.name == b.name;
}

export function isCostEqual(a: CardCost, b: CardCost) {
  return a.money == b.money && a.agents == b.agents;
}

export function isKeywordEqual(a: CardKeyword, b: CardKeyword) {
  return a[0] == b[0] && a[1] == b[1];
}

export function isPropsEqual(a: { [name: string]: any }, b: { [name: string]: any }) {
  const keys = Object.keys(a);
  return keys.length == Object.keys(b).length && keys.every((key) => a[key] == b[key]);
}

export function isCardStateEqual(a: CardState, b: CardState) {
  return (
    a.id == b.id &&
    a.hidden == b.hidden &&
    a.exhausted == b.exhausted &&
    a.name == b.name &&
    a.modifiers.length == b.modifiers.length &&
    a.modifiers.every((_, index) => isModifierEqual(a.modifiers[index], b.modifiers[index])) &&
    isPropsEqual(a.props, b.props)
  );
}

export function isCardInfoEqual(a: CardInfo, b: CardInfo) {
  return (
    a.text == b.text &&
    a.type == b.type &&
    isCostEqual(a.cost, b.cost) &&
    a.colors.length == b.colors.length &&
    a.colors.every((_, index) => a.colors[index] == b.colors[index]) &&
    a.keywords.length == b.keywords.length &&
    a.keywords.every((_, index) => isKeywordEqual(a.keywords[index], b.keywords[index]))
  );
}

export function isCardPropsEqual(a: CardProps, b: CardProps) {
  return (
    isCardStateEqual(a.state, b.state) &&
    isCardInfoEqual(a.info, b.info) &&
    a.shouldGlow == b.shouldGlow &&
    a.shouldDimWhenExhausted == b.shouldDimWhenExhausted &&
    a.borderTint == b.borderTint &&
    a.cosmetic?.level == b.cosmetic?.level &&
    a.cosmetic?.top == b.cosmetic?.top
  );
}

const imageTexture = moize((name: string) => {
  const imageTexture = Texture.from(`/images/${name}.png`);
  imageTexture.baseTexture.mipmap = MIPMAP_MODES.ON;
  return imageTexture;
}, {
  maxSize: Infinity
})

const getTextures = moize(() => {
  const border = Texture.from("/border_base.png");
  const border1 = Texture.from("/border_1.png");
  const border2 = Texture.from("/border_2.png");
  const border3 = Texture.from("/border_3.png");
  const borderBanner = Texture.from("/border_banner.png");
  const borderCost = Texture.from("/border_cost.png");
  const borderAgents = Texture.from("/border_agents.png");
  const borderType = Texture.from("/border_type.png");
  const borderTint = Texture.from("/border_tint.png");

  for (const texture of [
    border,
    border1,
    border2,
    border3,
    borderBanner,
    borderCost,
    borderAgents,
    borderType,
    borderTint,
  ]) {
    texture.baseTexture.mipmap = MIPMAP_MODES.ON;
  }

  return {
    border,
    border1,
    border2,
    border3,
    borderBanner,
    borderCost,
    borderAgents,
    borderType,
    borderTint,
  };
});

export default React.memo(
  React.forwardRef(function Card(props: CardProps, ref: Ref<PixiContainer>) {
    const color = hex[combineColors(props.info.colors)];
    const lastColor = useRef(getRGB(color));
    const containerRef = useRef() as MutableRefObject<PixiContainer>;
    const colorRef = useRef() as MutableRefObject<RectangleProps & Graphics>;
    const borderBannerRef = useRef() as MutableRefObject<PixiSprite>;
    const borderCostRef = useRef() as MutableRefObject<PixiSprite>;
    const borderAgentsRef = useRef() as MutableRefObject<PixiSprite>;
    const borderTypeRef = useRef() as MutableRefObject<PixiSprite>;
    const borderTintRef = useRef() as MutableRefObject<PixiSprite>;
    const levelCosmeticRef = useRef() as MutableRefObject<PixiSprite>;
    const lastHiddenTint = useRef(getRGB(props.state.hidden ? 0xaaaaaa : 0xffffff));
    const lastBorderTint = useRef(getRGB(props.borderTint ?? colorlessColor));
    const glowFilterRef = useRef(new GlowFilter());
    const dimFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
    const windFilterRef = useRef(new WindFilter());

    useImperativeHandle(ref, () => containerRef.current);

    useLayoutEffect(() => {
      const hiddenColor = props.state.hidden ? 0xaaaaaa : 0xffffff;

      colorRef.current.tint = color;
      borderBannerRef.current.tint = hiddenColor;
      borderCostRef.current.tint = hiddenColor;
      borderAgentsRef.current.tint = color;
      borderTypeRef.current.tint = hiddenColor;
      borderTintRef.current.alpha = props.borderTint ? 1 : 0;
      borderTintRef.current.tint = props.borderTint ?? colorlessColor;
      levelCosmeticRef.current.tint = hiddenColor;
      glowFilterRef.current.outerStrength = props.shouldGlow ? 4 : 0;
      glowFilterRef.current.enabled = props.shouldGlow ?? true;
      dimFilterRef.current.alpha = props.state.exhausted && props.shouldDimWhenExhausted ? 0.5 : 0;
      dimFilterRef.current.enabled = props.state.exhausted && (props.shouldDimWhenExhausted ?? false);
      windFilterRef.current.setSprite(borderBannerRef.current);
    }, []);

    useEffect(() => {
      const { r, g, b } = getRGB(color);
      anime({
        targets: lastColor.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        r,
        g,
        b,
        update() {
          if (colorRef.current) {
            colorRef.current.tint = getColor(lastColor.current);
          }

          if (borderAgentsRef.current) {
            borderAgentsRef.current.tint = getColor(lastColor.current);
          }
        },
      });
    }, [props.info.colors]);

    useEffect(() => {
      const { r, g, b } = getRGB(props.state.hidden ? 0xaaaaaa : 0xffffff);
      anime({
        targets: lastHiddenTint.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        r,
        g,
        b,
        update() {
          if (borderCostRef.current) {
            borderCostRef.current.tint = getColor(lastHiddenTint.current);
          }

          if (borderBannerRef.current) {
            borderBannerRef.current.tint = getColor(lastHiddenTint.current);
          }

          if (borderTypeRef.current) {
            borderTypeRef.current.tint = getColor(lastHiddenTint.current);
          }

          if (levelCosmeticRef.current) {
            levelCosmeticRef.current.tint = getColor(lastHiddenTint.current);
          }
        },
      });
    }, [props.state.hidden]);

    useEffect(() => {
      const alpha = props.borderTint ? 1 : 0;
      anime({
        targets: borderTintRef.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        alpha,
      });

      const { r, g, b } = getRGB(props.borderTint ?? colorlessColor);
      anime({
        targets: lastBorderTint.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        r,
        g,
        b,
        update() {
          if (borderTintRef.current) {
            borderTintRef.current.tint = getColor(lastBorderTint.current);
          }
        },
      });
    }, [props.borderTint]);

    useEffect(() => {
      const alpha = props.state.exhausted && props.shouldDimWhenExhausted ? 0.5 : 0;
      dimFilterRef.current.greyscale(0, true);
      anime({
        targets: dimFilterRef.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        alpha,
        update() {
          dimFilterRef.current.enabled = dimFilterRef.current.alpha != 0;
        },
      });
    }, [props.state.exhausted, props.shouldDimWhenExhausted]);

    useEffect(() => {
      glowFilterRef.current.color = color;
    }, [props.info.colors]);

    useEffect(() => {
      const outerStrength = props.shouldGlow ? 4 : 0;
      anime({
        targets: glowFilterRef.current,
        duration: 700,
        delay: 100,
        easing: "easeOutExpo",
        outerStrength,
        update() {
          glowFilterRef.current.enabled = glowFilterRef.current.outerStrength != 0;
        },
      });
    }, [props.shouldGlow]);

    const textures = getTextures();

    const levelCosmeticTexture: Texture = {
      0: Texture.EMPTY,
      1: textures.border1,
      2: textures.border2,
      3: textures.border3,
    }[props.cosmetic?.level ?? 0];

    const levelCosmetic =
      levelCosmeticTexture == null ? null : (
        <Sprite width={cardWidth} height={cardHeight} texture={levelCosmeticTexture} ref={levelCosmeticRef} />
      );

    let text = props.info.text;
    let keywords = collapseKeywords(props.info.keywords);

    if (keywords.length > 0) {
      text = `${keywords.map(getDisplayName).join(", ")}\n${text}`.trim();
    }

    let propsText: string[] = [];
    for (const [name, value] of Object.entries(props.state.props)) {
      if (value != undefined) {
        const upperName = name.charAt(0).toUpperCase() + name.slice(1);
        propsText.push(`${upperName}: ${value.name ?? value}`);
      }
    }

    if (propsText.length > 0) {
      text = `${text}\n${propsText.join(", ")}`;
    }

    return (
      <Container pivot={[cardWidth / 2, cardHeight / 2]} filters={[dimFilterRef.current, glowFilterRef.current]}>
        <Rectangle fill={0xffffff} width={cardWidth - 20} height={cardHeight - 40} x={10} y={14} ref={colorRef} />
        <Sprite width={cardWidth - 55} height={cardHeight / 2 - 40} x={30} y={60} texture={imageTexture(props.state.name)} />
        <Sprite width={cardWidth} height={cardHeight} texture={textures.border} />
        <Sprite width={cardWidth} height={cardHeight} texture={textures.borderType} ref={borderTypeRef} />
        <Container filters={props.cosmetic?.top ? [windFilterRef.current] : []}>
          <Sprite width={cardWidth} height={cardHeight} texture={textures.borderBanner} ref={borderBannerRef} />
          <Sprite width={cardWidth} height={cardHeight} texture={textures.borderCost} ref={borderCostRef} />
          <Sprite width={cardWidth} height={cardHeight} texture={textures.borderAgents} ref={borderAgentsRef} />
          <Sprite width={cardWidth} height={cardHeight} texture={textures.borderTint} ref={borderTintRef} />
          <Text
            anchor={[0.5, 0]}
            x={cardWidth / 2 + 20}
            y={28}
            text={props.state.name}
            style={{ fontSize: 32, tint: 0 }}
          />
          <Text
            anchor={[0.5, 0]}
            x={cardWidth / 2}
            y={283}
            text={props.info.type.toUpperCase()}
            style={{ fontSize: 28, tint: 0 }}
          />
          <Text
            anchor={[0.5, 0.5]}
            x={cardWidth / 2}
            y={cardHeight * (3 / 4) + 15}
            text={text}
            style={{ fontSize: 32, align: "center", maxWidth: cardWidth - 20, letterSpacing: 1 }}
          />
          <Text
            anchor={[0.5, 0.5]}
            x={40}
            y={40}
            text={Math.max(0, props.info.cost.money)}
            style={{ fontSize: 32, tint: 0 }}
          />
          <Text
            anchor={[0.5, 0.5]}
            x={40}
            y={92}
            text={Math.max(0, props.info.cost.agents) || ""}
            style={{ fontSize: 32, tint: 0 }}
          />
        </Container>
        {levelCosmetic}
      </Container>
    );
  }),
  isCardPropsEqual
);
