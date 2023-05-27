import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardColor, CardInfo, CardKeyword, CardState } from "../common/card";
import Text from "./Text";
import { filters as PixiFilters, RenderTexture, Texture } from "pixi.js";
import anime from "animejs";
import { GlowFilter } from "@pixi/filter-glow";
import { isEqual } from "lodash";
import { App } from "./Noir";
import { useTimeColorFilter } from "./Time";

export const cardHeight = targetResolution.height / 4;
export const cardWidth = cardHeight * (1 / 1.4);

export function getCardColor(colors: CardColor[]) {
  const colorMap = {
    orange: 0xeb6300,
    blue: 0x0087eb,
    green: 0x12eb00,
    purple: 0xd800eb,
    any: 0x767676,
  };

  return colorMap[colors.length == 1 ? colors[0] : "any"];
}

export function combineKeywords(a: CardKeyword, b: CardKeyword): CardKeyword {
  if (a[0] == "delay" && b[0] == "delay") {
    return ["delay", a[1] + b[1]];
  } else if (a[0] == "debt" && b[0] == "debt") {
    return ["debt", a[1] + b[1]];
  } else if (a[0] == "flammable" && b[0] == "flammable") {
    return ["flammable", Math.min(a[1], b[1])];
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
    flammable: "Flammable",
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
  shouldGlow?: boolean;
  shouldDimWhenExhausted?: boolean;
  shouldIgnoreTime?: boolean;
};

export function isCardStateEqual(a: CardState, b: CardState) {
  return (
    a.hidden == b.hidden &&
    a.exhausted == b.exhausted &&
    a.name == b.name &&
    a.protected == b.protected &&
    isEqual(a.props, b.props) &&
    isEqual(a.modifiers, b.modifiers)
  );
}

export function isCardInfoEqual(a: CardInfo, b: CardInfo) {
  return (
    a.text == b.text &&
    a.type == b.type &&
    isEqual(a.colors, b.colors) &&
    isEqual(a.cost, b.cost) &&
    isEqual(a.keywords, b.keywords)
  );
}

export function isCardPropsEqual(a: CardProps, b: CardProps) {
  return (
    isCardStateEqual(a.state, b.state) &&
    isCardInfoEqual(a.info, b.info) &&
    a.shouldGlow == b.shouldGlow &&
    a.shouldDimWhenExhausted == b.shouldDimWhenExhausted
  );
}

export default React.memo(
  React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
    const containerRef = useRef() as MutableRefObject<Required<Container>>;
    const glowFilterRef = useRef(new GlowFilter({ outerStrength: 0 }));
    const dimFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
    const timeColorFilterRef = useTimeColorFilter();
    const [texture, setTexture] = useState(null as RenderTexture | null);
    const app = useContext(App)!;

    useEffect(() => {
      if (containerRef.current && texture == null) {
        const renderTexture: RenderTexture | null = RenderTexture.create({
          width: cardWidth,
          height: cardHeight,
        });

        setTimeout(() => {
          app.renderer.render(containerRef.current, { renderTexture });
          setTexture(renderTexture);
        }, 0);

        return () => {
          renderTexture.destroy(true);
        };
      } else {
        setTexture(null);
      }
    }, [props.info]);

    useImperativeHandle(ref, () => containerRef.current);

    useEffect(() => {
      (containerRef.current as any).convertTo3d?.();
      dimFilterRef.current.alpha = 0;
    }, []);

    useEffect(() => {
      timeColorFilterRef.current.enabled = !props.shouldIgnoreTime;
    }, [props.shouldIgnoreTime]);

    useEffect(() => {
      const alpha = props.state.exhausted && props.shouldDimWhenExhausted ? 0.5 : 0;
      if (alpha != dimFilterRef.current.alpha) {
        dimFilterRef.current.greyscale(0, true);
        anime({
          targets: dimFilterRef.current,
          duration: 300,
          easing: "easeOutExpo",
          alpha,
          update() {
            dimFilterRef.current.enabled = dimFilterRef.current.alpha != 0;
          },
        });
      }
    }, [props.state.exhausted]);

    useEffect(() => {
      glowFilterRef.current.color = getCardColor(props.info.colors);
    }, [props.info.colors]);

    useEffect(() => {
      const outerStrength = props.shouldGlow ? 4 : 0;
      if (glowFilterRef.current.outerStrength != outerStrength) {
        anime({
          targets: glowFilterRef.current,
          duration: 300,
          easing: "easeOutExpo",
          outerStrength,
          update() {
            glowFilterRef.current.enabled = glowFilterRef.current.outerStrength != 0;
          },
        });  
      }
    }, [props.shouldGlow]);

    let text = props.info.text;
    let keywords = collapseKeywords(props.info.keywords);

    if (!props.state.protected) {
      keywords = keywords.filter((x) => x[0] != "protected");
    }

    if (keywords.length > 0) {
      text = `${keywords.map(getDisplayName).join(", ")}\n${text}`.trim();
    }

    if (!props.state.hidden) {
      text = `Revealed\n ${text}`;
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

    if (texture != null) {
      return (
        <Container
          pivot={[cardWidth / 2, cardHeight / 2]}
          filters={[
            glowFilterRef.current,
            dimFilterRef.current,
            timeColorFilterRef.current,
          ]}
          ref={containerRef}
        >
          <Rectangle
            fill={getCardColor(props.info.colors)}
            width={cardWidth - 40}
            height={cardHeight - 40}
            x={20}
            y={12}
          />
          <Sprite width={cardWidth} height={cardHeight} texture={Texture.from("/border.png")} />
          <Sprite texture={texture} />
        </Container>
      );
    } else {
      return (
        <Container
          pivot={[cardWidth / 2, cardHeight / 2]}
          filters={[
            glowFilterRef.current,
            dimFilterRef.current,
            timeColorFilterRef.current,
          ]}
        >
          <Rectangle
            fill={getCardColor(props.info.colors)}
            width={cardWidth - 40}
            height={cardHeight - 40}
            x={20}
            y={12}
          />
          <Sprite width={cardWidth} height={cardHeight} texture={Texture.from("/border.png")} />
          <Container ref={containerRef}>
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
              y={85}
              text={Math.max(0, props.info.cost.agents) || ""}
              style={{ fontSize: 32, tint: getCardColor(props.info.colors) }}
            />
          </Container>
        </Container>
      );
    }
  }),
  isCardPropsEqual
);
