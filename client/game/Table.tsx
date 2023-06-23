import React from "react";
import { useContext } from "react";
import Rectangle from "../Rectangle.js";
import { targetResolution } from "../Camera.js";
import { useDrop } from "react-dnd";
import { CardState } from "../../common/card.js";
import { ConnectionContext, PreparedContext } from "./Game.js";

export default function Table() {
  const connection = useContext(ConnectionContext);
  const { prepared } = useContext(PreparedContext);

  const [{}, drop] = useDrop(
    () => ({
      accept: "card",
      drop: (state: CardState) => {
        connection.emit({ type: "do", id: state.id, prepared });
      },
      collect: () => ({}),
    }),
    [prepared]
  );

  return (
    <>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={targetResolution.height * (3 / 4)}
        renderable={false}
      />
    </>
  );
}
