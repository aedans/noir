import React from "react";
import { Route, Router } from "wouter";
import { DndProvider } from "react-dnd";
import PIXIBackend from "./PIXIBackend.js";
import Camera from "./Camera.js";
import { Provider } from "react-redux";
import { store } from "./store.js";
import Menu from "./menu/Menu.js";
import Decks from "./decks/Decks.js";
import Editor from "./editor/Editor.js";
import { Application, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { addStats } from "pixi-stats";
import Replays from "./replays/Replays.js";
import Replay from "./replays/Replay.js";
import Queue from "./queue/Queue.js";
import Enqueue from "./queue/Enqueue.js";
import Play from "./play/Play.js";
import Solo from "./solo/Solo.js";

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
              <Route path="/play" component={Play} />
              <Route path="/solo" component={Solo} />
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
