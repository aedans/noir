import { Loader, MIPMAP_MODES, settings } from "pixi.js";
import * as React from "react";
import { createRoot } from "react-dom/client";
import Noir from "./Noir";

settings.RENDER_OPTIONS.antialias = true;
settings.ANISOTROPIC_LEVEL = 16;
settings.MIPMAP_TEXTURES = MIPMAP_MODES.ON;

Loader.shared.add("Oswald", "./Oswald.fnt").load(() => {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  root.render(<Noir />);
});
