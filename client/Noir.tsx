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
import { addStats } from "pixi-stats";
import Replays from "./replays/Replays";
import Replay from "./replays/Replay";

export type NoirProps = {
  app: Application;
};

export const App = React.createContext(null as Application | null);

export default function Noir(props: NoirProps) {
  const stats = addStats(document, props.app);
  (stats as any).stats.showPanel(1);
  Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

  return (
    <App.Provider value={props.app}>
      <Camera>
        <Provider store={store}>
          <DndProvider backend={PIXIBackend(props.app)}>
            <Router>
              <Route path="/play" component={Play} />
              <Route path="/game/:queue/:deck" component={Game} />
              <Route path="/decks" component={Decks} />
              <Route path="/edit/:deck" component={Editor} />
              <Route path="/replays" component={Replays} />
              <Route path="/replays/:replay" component={Replay} />
              <Route path="/" component={Menu} />
            </Router>
          </DndProvider>
        </Provider>
      </Camera>
    </App.Provider>
  );
}
