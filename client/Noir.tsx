import React from "react";
import { Stage } from "react-pixi-fiber";
import { DndProvider } from "react-dnd";
import PIXIBackend from "./PIXIBackend";
import Camera from "./Camera";
import { Provider } from "react-redux";
import { store } from "./store";
import Game from "./game/Game";

export default function Noir() {
  const options = {
    width: window.screen.width,
    height: window.screen.height,
    resolution: window.devicePixelRatio,
  };

  return (
    <Stage options={options}>
      <Camera>
        <Provider store={store}>
          <DndProvider backend={PIXIBackend}>
            <Game />
          </DndProvider>
        </Provider>
      </Camera>
    </Stage>
  );
}
