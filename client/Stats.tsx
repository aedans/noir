import { addStats } from "pixi-stats";
import { Ticker, UPDATE_PRIORITY } from "pixi.js";
import React from "react";
import { useContext, useEffect } from "react";
import { AppContext } from "react-pixi-fiber";

export default function Stats() {
  const app = useContext(AppContext);

  useEffect(() => {
    const stats = addStats(document, app);
    (stats as any).stats.showPanel(1);
    Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
  });

  return <></>;
}
