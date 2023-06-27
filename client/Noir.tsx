import React, { Suspense } from "react";
import { Route, Router } from "wouter";
import Camera from "./Camera.js";
import { Provider } from "react-redux";
import { store } from "./store.js";
import { Application, Ticker, UPDATE_PRIORITY } from "./pixi.js";
import { addStats } from "pixi-stats";
import {AppContext} from "@pixi/react"

export type NoirProps = {
  app: Application;
};

export default function Noir(props: NoirProps) {
  const Play = React.lazy(() => import("./play/Play"));
  const Solo = React.lazy(() => import("./solo/Solo"));
  const Enqueue = React.lazy(() => import("./queue/Enqueue"));
  const Queue = React.lazy(() => import("./queue/Queue"));
  const Decks = React.lazy(() => import("./decks/Decks"));
  const Editor = React.lazy(() => import("./editor/Editor"));
  const Replays = React.lazy(() => import("./replays/Replays"));
  const Replay = React.lazy(() => import("./replays/Replay"));
  const Menu = React.lazy(() => import("./menu/Menu"));

  if (localStorage.getItem("debug") == "true") {
    const stats = addStats(document, props.app);
    (stats as any).stats.showPanel(1);
    Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
  }

  return (
    <AppContext.Provider value={props.app}>
      <Camera>
        <Provider store={store}>
          <Router>
            <Suspense fallback={<></>}>
              <Route path="/play" component={Play} />
              <Route path="/solo" component={Solo} />
              <Route path="/enqueue/:queue" component={Enqueue} />
              <Route path="/queue/:queue/:deck" component={Queue} />
              <Route path="/decks" component={Decks} />
              <Route path="/edit/:deck" component={Editor} />
              <Route path="/replays" component={Replays} />
              <Route path="/replays/:id" component={Replay} />
              <Route path="/" component={Menu} />
            </Suspense>
          </Router>
        </Provider>
      </Camera>
    </AppContext.Provider>
  );
}
