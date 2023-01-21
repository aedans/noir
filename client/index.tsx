import { addStats } from "pixi-stats";
import { Application, Loader, MIPMAP_MODES, settings, Ticker, UPDATE_PRIORITY } from "pixi.js";
import * as React from "react";
import { render } from "react-pixi-fiber";
import Noir from "./Noir";

settings.RENDER_OPTIONS.antialias = true;
settings.ANISOTROPIC_LEVEL = 16;
settings.MIPMAP_TEXTURES = MIPMAP_MODES.ON;
settings.SORTABLE_CHILDREN = true;

Loader.shared
  .add("Oswald", "/Oswald.fnt")
  .add("Border", "/border.png")
  .load(() => {
  const canvasElement = document.getElementById("root") as HTMLCanvasElement;

  const app = new Application({
    view: canvasElement,
    width: window.screen.width,
    height: window.screen.height,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  const stats = addStats(document, app);
  (stats as any).stats.showPanel(1);
  Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

  render(<Noir />, app.stage);
});
