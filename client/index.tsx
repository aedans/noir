import React from "react";
import { Application, Loader, MIPMAP_MODES, settings } from "pixi.js";
import { render as renderPixi } from "react-pixi-fiber";
import Noir from "./Noir.js";
import { updateLocalStorage } from "./store.js";

settings.RENDER_OPTIONS.antialias = true;
settings.ANISOTROPIC_LEVEL = 16;
settings.MIPMAP_TEXTURES = MIPMAP_MODES.ON;
settings.SORTABLE_CHILDREN = true;

updateLocalStorage();

Loader.shared.add("Oswald", "/Oswald.fnt").load(() => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

  const app = new Application({
    view: canvasElement,
    width: window.screen.width,
    height: window.screen.height,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  renderPixi(<Noir app={app} />, app.stage);
});
