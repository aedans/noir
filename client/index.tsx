import { addStats } from "pixi-stats";
import { Application, Loader, MIPMAP_MODES, settings, Ticker, UPDATE_PRIORITY } from "pixi.js";
import * as React from "react";
import { render } from "react-pixi-fiber";
import Noir from "./Noir";
import { Cull } from "@pixi-essentials/cull";

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

    render(<Noir app={app} />, app.stage);
  });
