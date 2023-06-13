import React from "react";
import { Route, Router } from "wouter";
import { DndProvider } from "react-dnd";
import PIXIBackend from "./PIXIBackend";
import Camera from "./Camera";
import { Provider } from "react-redux";
import { store } from "./store";
import Menu from "./menu/Menu";
import Decks from "./decks/Decks";
import Editor from "./editor/Editor";
import { Application, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { addStats } from "pixi-stats";
import Replays from "./replays/Replays";
import Replay from "./replays/Replay";
import Queue from "./queue/Queue";
import Enqueue from "./queue/Enqueue";

export type NoirProps = {
  app: Application;
};

export const App = React.createContext(null as Application | null);

export default function Noir(props: NoirProps) {
  if (localStorage.getItem("debug") == "true") {
    const stats = addStats(document, props.app);
    (stats as any).stats.showPanel(1);
    Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
  }

  return (
    <App.Provider value={props.app}>
      <Camera>
        <Provider store={store}>
          <DndProvider backend={PIXIBackend(props.app)}>
            <Router>
              <Route path="/enqueue/:queue" component={Enqueue} />
              <Route path="/queue/:queue/:deck" component={Queue} />
              <Route path="/decks" component={Decks} />
              <Route path="/edit/:deck" component={Editor} />
              <Route path="/replays" component={Replays} />
              <Route path="/replays/:id" component={Replay} />
              <Route path="/" component={Menu} />
            </Router>
          </DndProvider>
        </Provider>
      </Camera>
    </App.Provider>
  );
}
