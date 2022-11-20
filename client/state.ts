import { Container, Rectangle } from "pixi.js";
import { app, camera } from ".";
import { Entity, entityContainer } from "./entity";
import { cardsState } from "./states/cards";
import { decksState } from "./states/decks";
import { mainState } from "./states/main";
import { animateTime } from "./ui";

export interface StateInstance<A = {}> {
  state: State<A>,
  children: Entity[],
  color?: number,
  previous?: State,
  zones?: { [name: string]: Zone },
  init?: () => Promise<void>
}

export interface State<A = {}> {
  name: string,
  scene: string,
  instantiate: (params: A) => Promise<StateInstance<A>>,
}

const states: State<any>[] = [mainState, decksState, cardsState];

export function getState(name: string) {
  return states.find(s => s.name == name) ?? mainState;
}

window.addEventListener('popstate', () => {
  if (currentStateInstance.previous) {
    enterState(currentStateInstance.previous, {});
  }
});

export let currentStateInstance: StateInstance<any>;
export let light = 1;

export const flickerFrames = [0, .2, .4, .6, .8, 1];

function relightStateInstance(instance: StateInstance<any>) {
  const source = { x: app.screen.width / 2, y: -app.screen.height / 2 };
  for (const object of instance.children) {
    object.relight(source);
  }

  camera.relight(source);
}

async function enterStateInstance(instance: StateInstance<any>) {
  for (const frame of flickerFrames) {
    light = frame;
    relightStateInstance(instance);
    await animateTime(1, () => {});
  }

  light = 1;
  relightStateInstance(instance);
}

async function exitStateInstance(instance: StateInstance<any>) {
  for (const frame of [...flickerFrames].reverse()) {
    light = frame;
    relightStateInstance(instance);
    await animateTime(1, () => {});
  }

  light = 0;
  relightStateInstance(instance);

  for (const object of instance.children) {
    object.visible = false;
  }
}

export function updateStateInstance(instance: StateInstance<any> | undefined, time: number) {
  if (instance) {
    relightStateInstance(instance);

    for (const entity of instance.children) {
      entity.update?.(time);
    }
  }

  camera.update?.(time);
}

export function instantiateStateInstance<A>(instance: StateInstance<A>) {
  if (instance) {
    for (const child of instance.children) {
      camera.addChild(child);
    }
  
    for (const [_, zone] of Object.entries(instance.zones ?? {})) {
      camera.addChild(zone.container);
    }
  
    relightStateInstance(instance);
  }
}

export async function enterState<A>(state: State<A>, params: A) {
  const currentState = currentStateInstance?.state;
  const shouldTransition = currentState != null && state.scene != currentState.scene;
  if (shouldTransition && currentStateInstance) {
    await exitStateInstance(currentStateInstance);
  }

  history.pushState({}, '', `?name=${state.name}`);

  camera.removeChildren();

  const instance = await state.instantiate(params);
  instantiateStateInstance(instance);

  camera.sortChildren();

  currentStateInstance = instance;

  await instance.init?.();
  
  if (shouldTransition) {
    await enterStateInstance(instance);
  }
}

export type Zone = Rectangle & {
  container: Entity & Container,
  onChange: () => Promise<void>,
  add: (card: Entity, index: number) => () => void,
}

export function createZone(rectangle: Rectangle, onChange: (children: Entity[]) => Promise<void>): Zone {
  const container = entityContainer(new Container());
  let children: Entity[] = [];
  
  return Object.assign(rectangle, {
    container,
    onChange: () => onChange(children),
    add(child: Entity, index: number) {
      children.splice(index, 0, child);
      container.addChildAt(child, index);
      return () => {
        container.removeChild(child);
        children = children.filter(c => c != child);
      }
    },
  });
}

export function zoneOf(position: { x: number, y: number }, orelse: string, instance: StateInstance<any> = currentStateInstance) {
  for (const [name, zone] of Object.entries(instance.zones ?? {})) {
    if (zone.contains(position.x - app.screen.width / 2, position.y - app.screen.height / 2)) {
      return name;
    }
  }
  return orelse;
}