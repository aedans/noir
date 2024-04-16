import React from "react";
import { useContext } from "react";
import Rectangle from "../Rectangle.js";
import { targetResolution } from "../Camera.js";
import { useDrop } from "react-dnd";
import { CardState } from "../../common/card.js";
import { ConnectionContext, CostDisplayContext } from "./Game.js";
import { Container } from "@pixi/react";

export default function Table() {
  const connection = useContext(ConnectionContext);
  const { costDisplay } = useContext(CostDisplayContext);

  const [{}, drop] = useDrop(
    () => ({
      accept: "card",
      drop: (state: CardState) => {
        connection.emit({ type: "do", id: state.id, prepared: costDisplay.prepared });
      },
      collect: () => ({}),
    }),
    [costDisplay.prepared]
  );

  return (
    <>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Container renderable={false}>
        <Rectangle
          ref={(current) => drop({ current })}
          width={targetResolution.width}
          height={targetResolution.height * (3 / 4)}
        />
      </Container>
    </>
  );
}
