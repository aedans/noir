import { IDisplayObject3d } from "pixi-projection";
import { Graphics } from "pixi.js";
import { app, camera } from ".";
import { Entity } from "./entity";
import { currentStateInstance, zoneOf } from "./state";

export let targetResolution = {
  width: 1920,
  height: 1080,
};

const mask = new Graphics();
mask.beginFill(0);
mask.drawRect(0, 0, 1, 1);
mask.endFill();

export function screenToTarget(x: number, y: number) {
  return {
    x: (x - mask.x) / (mask.width / targetResolution.width),
    y: (y - mask.y) / (mask.height / targetResolution.height), 
  };
}

export function onResize() {
  let width = window.innerWidth, height = window.innerHeight;
  if (window.innerWidth * 9 > window.innerHeight * 16) {
    width = window.innerHeight * (16/9);
  }
  
  if (window.innerWidth * 9 < window.innerHeight * 16) {
    height = window.innerWidth * (9/16);
  }

  camera.position.set(
    (window.innerWidth - width) / 2,
    (window.innerHeight - height) / 2,
  );

  camera.scale.set(
    width / targetResolution.width,
    height / targetResolution.height,
  );

  mask.position.set(camera.x, camera.y);
  mask.scale.set(width, height);
  camera.mask = mask;

  camera.setPlanes(targetResolution.width / 2, 30, 10000, true);
}

export function lerp(v0: number, v1: number, t: number) {
  return v0*(1-t)+v1*t;
}

export function onTick(fn: (time: number) => boolean | void) {
  let time = 0;
  const f = (dt: number) => {
    time += dt;
    if(fn(time)) {
      app.ticker.remove(f)
    }
  }

  app.ticker.add(f);
  return f;
}

export function animateTime(length: number, f: (time: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    onTick((time) => {
      f(time / length);
      if (time >= length) {
        f(1);
        resolve();
        return true;
      }
    });
  });
}

export function animateTo(entity: Entity, position: { x: number, y: number }): Promise<void> {
  const dx = position.x - entity.x, dy = position.y - entity.y;
  if (dx == 0 && dy == 0) return Promise.resolve();
  const animation = animateTime(Math.ceil(Math.sqrt(dx * dx + dy * dy) / 50), (time) => {
    if (entity.currentAnimation != animation) return; 
    entity.x = lerp(entity.x, position.x, time);
    entity.y = lerp(entity.y, position.y, time);
  });
  entity.currentAnimation = animation;
  return animation;
}

export type MouseListener<A = void> = (position: { x: number, y: number }) => A;

let globalZ = 0;

export function draggable(entity: Entity & IDisplayObject3d, mousedown: MouseListener, mousemove: MouseListener, mouseup: MouseListener, onclick?: MouseListener) {
  entity.setHover(.5);

  globalZ = Math.max(entity.zIndex, globalZ);

  entity.on('mousedown', e => {
    const clickTime = Date.now();

    const targetPosition = screenToTarget(e.data.global.x, e.data.global.y);
    mousedown(targetPosition);

    entity.zIndex = ++globalZ;
    entity.parent.sortChildren();

    delete entity.currentAnimation;
    animateTime(5, (time) => {
      entity.setHover(lerp(.5, 5, time));
      const targetPosition = screenToTarget(e.data.global.x, e.data.global.y);
      entity.position.copyFrom({
        x: lerp(entity.x, targetPosition.x, time),
        y: lerp(entity.y, targetPosition.y, time),
      });
    });

    function mouseMoveListener(e: MouseEvent) {
      const targetPosition = screenToTarget(e.x, e.y);
      const dx = targetPosition.x - entity.x;
      const dy = targetPosition.y - entity.y;

      ddx += dx;
      ddy += dy;
      
      entity.position.copyFrom(targetPosition);
  
      mousemove(targetPosition);
    }

    function mouseUpListener(e: MouseEvent) {
      animateTime(5, (time) => entity.setHover(lerp(5, .5, time)))
        .then(() => entity.setHover(.5));
  
      const targetPosition = screenToTarget(e.x, e.y);
      if ((Date.now() - clickTime) < 100) {
        onclick?.(targetPosition);
      } else {
        mouseup(targetPosition);
      }

      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
    }

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  });

  let ddx = 0, ddy = 0;

  return Object.assign(entity, { 
    update: (time: number) => {
      ddx *= .9;
      ddy *= .9;
      
      entity.euler.yaw = ddx / 250;
      entity.euler.pitch = ddy / 250;
    }
  })
}

export type ZoneListener<A = void> = { [name: string]: (doExit: () => void, doEnter: (name: string) => void) => A }

export async function onZoneChange(name: string) {
  await (currentStateInstance.zones ?? {})[name].onChange();
}

export async function dragAndDroppable(entity: Entity & IDisplayObject3d, last: string, index: number, enter: ZoneListener<number>, exit: ZoneListener<boolean>, defaults: { [name: string]: () => Promise<string> }, mousemove: MouseListener) {
  let callback = (currentStateInstance.zones ?? {})[last].add(entity, index);

  function doExit() {
    callback();
    camera.addChild(entity);  
    
    if (exit[last]?.(doExit, doEnter)) {
      onZoneChange(last);
    }
  }

  function doEnter(name: string) {
    const zone = (currentStateInstance.zones ?? {})[name];

    const index = enter[name]?.(doExit, doEnter) ?? 0
    if (index >= 0) {
      camera.removeChild(entity);
      callback = zone.add(entity, index);
      last = name;
      zone.onChange();
    }
  }

  draggable(entity,
    () => doExit(),
    mousemove,
    (position) => doEnter(zoneOf(position, last)),
    (position) => (defaults[last]() ?? Promise.resolve(last)).then(name => doEnter(name)));

  await onZoneChange(last);

  return entity;
}