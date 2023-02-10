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
import { Application, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { Cull } from "@pixi-essentials/cull";
import { addStats } from "pixi-stats";

export type NoirProps = {
  app: Application;
};

export const App = React.createContext(null as Application | null);

export default function Noir(props: NoirProps) {
  const cull = new Cull({ recursive: true });

  // props.app.renderer.options.
  props.app.renderer.on("prerender", () => {
    cull.clear();
    cull.addAll(props.app.stage.children);
    cull.cull(props.app.renderer.screen);
  });

  const stats = addStats(document, props.app);
  (stats as any).stats.showPanel(1);
  Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

  return (
    <App.Provider value={props.app}>
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
    </App.Provider>
  );
}
