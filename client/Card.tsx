import React, {
  MutableRefObject,
  ReactElement,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Container, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardColors, CardInfo, CardKeyword, CardState } from "../common/card";
import Text from "./Text";
import { MIPMAP_MODES, filters as PixiFilters, Sprite as PixiSprite, RenderTexture, Texture } from "pixi.js";
import anime from "animejs";
import { GlowFilter } from "@pixi/filter-glow";
import { isEqual } from "lodash";
import { App } from "./Noir";
import { ColorReplaceFilter } from "@pixi/filter-color-replace";

export const cardHeight = targetResolution.height / 4;
export const cardWidth = cardHeight * (1 / 1.4);

export const hex = {
  orange: 0xeb6300,
  blue: 0x0087eb,
  green: 0x12eb00,
  purple: 0xd800eb,
  multicolor: 0x767676,
  colorless: 0x767676,
};

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
  } else if (a[0] == "abscond" && b[0] == "abscond") {
    return ["abscond", a[1] + b[1]];
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
    abscond: "Abscond",
    expunge: "Expunge",
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
  borderTint?: number;
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

const ColoredImage = React.memo(function ColoredImage(props: { name: string; color: number }) {
  const [texture, setTexture] = useState(null as RenderTexture | null);
  const app = useContext(App)!;

  const url = `/images/${props.name}.png`;

  const filter = new ColorReplaceFilter();
  filter.epsilon = 0.01;
  filter.originalColor = 0x767676;
  filter.newColor = props.color;

  useEffect(() => {
    let renderTexture: RenderTexture | null = null;

    Texture.fromURL(url).then((grayTexture) => {
      const sprite = new PixiSprite(grayTexture);
      sprite.filters = [filter];

      renderTexture = RenderTexture.create({
        width: grayTexture.width,
        height: grayTexture.height,
      });

      renderTexture.baseTexture.mipmap = MIPMAP_MODES.ON;

      app.renderer.render(sprite, { renderTexture });
      setTexture(renderTexture);
    });

    return () => {
      renderTexture?.destroy(true);
    };
  }, [props.color, props.name]);

  return (
    <Sprite width={cardWidth - 55} height={cardHeight / 2 - 40} x={30} y={60} texture={texture ?? Texture.from(url)} />
  );
});

const CardImpl = React.forwardRef(function CardImpl(props: CardProps, ref: Ref<Container>) {
  const containerRef = useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => containerRef.current);

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

  return (
    <Container ref={containerRef}>
      <Text anchor={[0.5, 0]} x={cardWidth / 2 + 20} y={28} text={props.state.name} style={{ fontSize: 32, tint: 0 }} />
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
        style={{ fontSize: 32, tint: hex[combineColors(props.info.colors)] }}
      />
    </Container>
  );
});

export default React.memo(
  React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
    const containerRef = useRef() as MutableRefObject<Required<Container>>;
    const glowFilterRef = useRef(new GlowFilter());
    const dimFilterRef = useRef(new PixiFilters.ColorMatrixFilter());
    const [texture, setTexture] = useState(null as RenderTexture | null);
    const app = useContext(App)!;

    useEffect(() => {
      if (containerRef.current) {
        const renderTexture = RenderTexture.create({
          width: cardWidth,
          height: cardHeight,
        });

        app.renderer.render(containerRef.current, { renderTexture });
        setTexture(renderTexture);

        return () => {
          renderTexture.destroy(true);
        };
      } else {
        setTexture(null);
      }
    }, [props.info]);

    useImperativeHandle(ref, () => containerRef.current);

    useLayoutEffect(() => {
      (containerRef.current as any).convertTo3d?.();
      glowFilterRef.current.outerStrength = 0;
      glowFilterRef.current.enabled = false;
      dimFilterRef.current.alpha = 0;
      dimFilterRef.current.enabled = false;
    }, []);

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
      glowFilterRef.current.color = hex[combineColors(props.info.colors)];
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

    const info = texture ? <Sprite texture={texture} /> : <CardImpl {...props} ref={containerRef} />;

    let borderTintSprite: ReactElement | undefined;
    if (props.borderTint) {
      borderTintSprite = (
        <Sprite
          width={cardWidth}
          height={cardHeight}
          texture={Texture.from("/border_tint.png")}
          tint={props.borderTint}
        />
      );
    }

    return (
      <Container pivot={[cardWidth / 2, cardHeight / 2]} filters={[glowFilterRef.current, dimFilterRef.current]}>
        <Rectangle
          fill={hex[combineColors(props.info.colors)]}
          width={cardWidth - 40}
          height={cardHeight - 40}
          x={20}
          y={12}
        />
        <ColoredImage name={props.state.name} color={hex[combineColors(props.info.colors)]} />
        <Sprite width={cardWidth} height={cardHeight} texture={Texture.from("/border.png")} />
        <Sprite width={cardWidth} height={cardHeight} texture={Texture.from("/border_agents.png")} />
        {borderTintSprite}
        {info}
      </Container>
    );
  }),
  isCardPropsEqual
);
