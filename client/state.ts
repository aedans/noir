import { app } from ".";
import { menuState } from "./states/menu";

const states: (() => void)[] = [];

window.addEventListener('popstate', () => {
  if (states.length > 0) {
    states.pop()();
  } else {
    menuState();
  }
});

export function beginState(name: string) {
  if (name == "") {
    history.pushState({}, '', '/');
  } else {
    history.pushState({}, '', `?state=${name}`);
  }

  app.stage.removeChildren();
}

export function pushState(from: () => void, to: () => void) {
  states.push(from);
  to();
}