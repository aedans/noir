import { Camera3d } from "pixi-projection";
import { addStats } from "pixi-stats";
import { Application, Loader, Ticker, UPDATE_PRIORITY } from "pixi.js";
import ButtonEntity from "./ButtonEntity";
import ResizeManager from "./ResizeManager";

export const app = new Application({
  resizeTo: window,
  resolution: window.devicePixelRatio || 1,
  antialias: true,
  autoDensity: true,
});

document.body.appendChild(app.view);

export const camera = new Camera3d();
camera.sortableChildren = true;
app.stage.addChild(camera);

const stats = addStats(document, app);
(stats as any).stats.showPanel(1);
Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

export const resizeManager = new ResizeManager();

Loader.shared.add("Oswald", "./Oswald.fnt").load(() => {
  app.stage.addChild(
    new ButtonEntity("Test", () => {}, {
      y: 100,
    })
  );
});
