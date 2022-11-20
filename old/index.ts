import { Camera3d } from 'pixi-projection';
import { addStats } from 'pixi-stats';
import { Application, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { entityContainer } from './entity';
import { currentStateInstance, enterState, getState, updateStateInstance } from './state';
import { onResize, onTick } from './ui';

export const app = new Application({
  resizeTo: window,
  resolution: window.devicePixelRatio || 1,
  antialias: true,
  autoDensity: true,
});

document.body.style.overflow = "hidden";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.appendChild(app.view);

export const camera = entityContainer(new Camera3d());
camera.sortableChildren = true;

app.stage.addChild(camera);

const stats = addStats(document, app);
(stats as any).stats.showPanel(1);
Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

window.onload = () => {  
  app.loader
    .add('Oswald', './Oswald.fnt')
    .load(() => {
      onTick((time: number) => {
        updateStateInstance(currentStateInstance, time);
        onResize();
      });
      let params = new URLSearchParams(window.location.search);
      enterState(getState(params.get("name")!), {});
    });
}
