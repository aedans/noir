import { DisplayObject, Ticker } from "pixi.js";

export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t;
}

export function onTick(fn: (time: number) => boolean | void) {
  let time = 0;
  const f = (dt: number) => {
    time += dt;
    if (fn(time)) {
      Ticker.shared.remove(f);
    }
  };

  Ticker.shared.add(f);
  return f;
}

export function animateTime(length: number, f: (time: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    onTick((time) => {
      try {
        f(time / length);
        if (time >= length) {
          f(1);
          resolve();
          return true;
        }
      } catch (e) {
        return true;
      }
    });
  });
}

export function animateTo(
  object: Pick<DisplayObject, "getGlobalPosition" | "transform" | "parent">,
  position: { x: number; y: number }
): Promise<void> {
  const dx = position.x - object.getGlobalPosition().x;
  const dy = position.y - object.getGlobalPosition().y;
  if (dx == 0 && dy == 0) return Promise.resolve();
  return animateTime(Math.ceil(Math.sqrt(dx * dx + dy * dy) / 20), (time) => {
    object.transform.position.copyFrom(
      object.parent.toLocal({
        x: lerp(object.getGlobalPosition().x, position.x, time),
        y: lerp(object.getGlobalPosition().y, position.y, time),
      })
    );
  });
}
