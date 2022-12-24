import React from "react";
import { Stage } from "react-pixi-fiber";
import { DndProvider } from "react-dnd";
import PIXIBackend from "./PIXIBackend";
import Camera from "./Camera";
import { Provider } from "react-redux";
import { store } from "./store";
import Game from "./game/Game";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Menu from "./menu/Menu";
import Play from "./play/Play";
import Decks from "./decks/Decks";
import Editor from "./editor/Editor";

export default function Noir() {
  const options = {
    width: window.screen.width,
    height: window.screen.height,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  };

  return (
    <Stage options={options}>
      <Camera>
        <Provider store={store}>
          <DndProvider backend={PIXIBackend}>
            <BrowserRouter>
              <Routes>
                <Route path="/play" element={<Play />} />
                <Route path="/game" element={<Game />} />
                <Route path="/decks" element={<Decks />} />
                <Route path="/edit" element={<Editor />}/>
                <Route path="/" element={<Menu />} />
              </Routes>
            </BrowserRouter>
          </DndProvider>
        </Provider>
      </Camera>
    </Stage>
  );
}
