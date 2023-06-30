import { Application, Assets, settings } from "./pixi.js";

settings.RENDER_OPTIONS.antialias = true;

const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const app = new Application({
  view: canvasElement,
  width: window.screen.width,
  height: window.screen.height,
  resolution: window.devicePixelRatio,
  autoDensity: true,
});

Promise.all([import("./Noir"), import("react"), import("@pixi/react"), Assets.load("/Oswald.fnt")]).then(([Noir, React, { createRoot }]) => {
  const root = createRoot(app.stage);
  root.render(<Noir.default app={app} />);
});

import("./store").then((store) => {
  store.updateLocalStorage();
});
