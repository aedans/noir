import { Application, settings } from 'pixi.js';
import { loadCards } from './card';
import { buildState } from './states/build';
import { cardsState } from './states/cards';
import { decksState } from './states/decks';
import { menuState } from './states/menu';
import { queueState } from './states/queue';

loadCards();

export const app = new Application({ 
  width: window.innerWidth,
  height: window.innerHeight,
  resizeTo: window
});

document.body.style.overflow = "hidden";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.appendChild(app.view);

settings.ROUND_PIXELS = true;

const state = new URLSearchParams(window.location.search).get("state") ?? "";

if (state.startsWith("game")) {
  const matches = state.match(/game\/(.+)/);
  if (matches == null) {
    decksState(queueState);
  } else {
    queueState(matches[1]);
  }
} else if (state.startsWith("decks")) {
  decksState();
} else if (state.startsWith("build")) {
  const matches = state.match(/build\/(.+)/);
  if (matches == null) {
    buildState(window.prompt("Deck Name") ?? "New Deck");
  } else {
    buildState(matches[1]);
  }
} else if (state.startsWith("cards")) {
  cardsState();
} else {
  menuState();
}
