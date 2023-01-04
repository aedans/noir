import React from "react";
import { Route, Router } from "wouter";
import { DndProvider } from "react-dnd";
import PIXIBackend from "./PIXIBackend";
import Camera from "./Camera";
import { Provider } from "react-redux";
import { store } from "./store";
import Game from "./game/Game";
import Menu from "./menu/Menu";
import Play from "./play/Play";
import Decks from "./decks/Decks";
import Editor from "./editor/Editor";

export default function Noir() {
  return (
    <Camera>
      <Provider store={store}>
        <DndProvider backend={PIXIBackend}>
          <Router>
            <Route path="/play" component={Play} />
            <Route path="/game/:queue/:deck" component={Game} />
            <Route path="/decks" component={Decks} />
            <Route path="/edit/:deck" component={Editor} />
            <Route path="/" component={Menu} />
          </Router>
        </DndProvider>
      </Provider>
    </Camera>
  );
}
