import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardColor, CardInfo, CardKeyword, CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { filters as PixiFilters, MIPMAP_MODES, RenderTexture, Texture } from "pixi.js";
import anime from "animejs";
import { GlowFilter } from "@pixi/filter-glow";
import { isEqual } from "lodash";
import { App } from "./Noir";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export const smallCardScale = 1 / 4;
export const smallCardWidth = cardWidth * smallCardScale;
export const smallCardHeight = cardHeight * smallCardScale;

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
  info: CardInfo;
  scale?: number;
  shadow?: number;
  shouldGlow?: boolean;
  shouldDimWhenExhausted?: boolean;
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
    a.shadow == b.shadow &&
    a.shouldGlow == b.shouldGlow &&
    a.shouldDimWhenExhausted == b.shouldDimWhenExhausted
  );
}

export default React.memo(
  React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
    const containerRef = useRef() as MutableRefObject<Required<Container>>;
    const dimFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
    const dropShadowFilterRef = useRef(new DropShadowFilter({ alpha: 0.5, blur: 1, distance: 0 }));
    const glowFilterRef = useRef(new GlowFilter({ outerStrength: 0 }));
    const [texture, setTexture] = useState(null as RenderTexture | null);
    const app = useContext(App)!;

    useEffect(() => {
      if (containerRef.current && texture == null) {
        const renderTexture = RenderTexture.create({
          width: cardWidth,
          height: cardHeight,
        });

        renderTexture.baseTexture.mipmap = MIPMAP_MODES.ON;

        setTimeout(() => {
          containerRef.current.setTransform();
          containerRef.current.filters = [];
          app.renderer.render(containerRef.current, { renderTexture });
          setTexture(renderTexture);
        }, 300);

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
        update() {
          dimFilterRef.current.enabled = dimFilterRef.current.alpha != 0;
        },
      });
    }, [props.state.exhausted]);

    useEffect(() => {
      glowFilterRef.current.color = getCardColor(props.info.colors);
    }, [props.info.colors]);

    useEffect(() => {
      anime({
        targets: glowFilterRef.current,
        duration: 300,
        easing: "easeOutExpo",
        outerStrength: props.shouldGlow ? 4 : 0,
        update() {
          glowFilterRef.current.enabled = glowFilterRef.current.outerStrength != 0;
        },
      });
    }, [props.shouldGlow]);

    let text = props.info.text;
    let keywords = props.info.keywords;

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

    if (texture != null) {
      return (
        <Container
          pivot={[cardWidth / 2, cardHeight / 2]}
          filters={[glowFilterRef.current, dimFilterRef.current]}
          width={cardWidth}
          height={cardHeight}
          ref={containerRef}
        >
          <Sprite width={cardWidth} height={cardHeight} texture={texture} />
        </Container>
      );
    } else {
      return (
        <Container
          pivot={[cardWidth / 2, cardHeight / 2]}
          width={cardWidth}
          height={cardHeight}
          filters={[glowFilterRef.current, dimFilterRef.current]}
          ref={containerRef}
        >
          <Rectangle
            fill={getCardColor(props.info.colors)}
            width={cardWidth - 100}
            height={cardHeight - 100}
            x={50}
            y={50}
          />
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
            text={Math.max(0, props.info.cost.money)}
            style={{ fontSize: 128, tint: 0 }}
          />
          <Text
            anchor={[0.5, 0.5]}
            x={160}
            y={340}
            text={Math.max(0, props.info.cost.agents) || ""}
            style={{ fontSize: 128, tint: getCardColor(props.info.colors) }}
          />
        </Container>
      );
    }
  }),
  isCardPropsEqual
);
