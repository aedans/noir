import { Container } from "pixi.js";
import { app } from "..";
import { getDecks } from "../decks";
import { button } from "../sprites/text";
import { beginState, pushState } from "../state";
import { above, center, request, vertical } from "../ui";
import { buildState } from "./build";

export function decksState(cc: (name: string) => void = buildState) {
  beginState('decks');

  const list = new Container();

  const create = button("Create Deck");

  create.on('pointerdown', () => pushState(() => decksState(cc), () => buildState(request("Deck Name", "New Deck"))));

  const sprites = []
  for (const deck of getDecks()) {
    const sprite = button(deck);

    sprite.on('pointerdown', () => pushState(() => decksState(cc), () => cc(deck)));

    list.addChild(sprite);
    sprites.push(sprite);
  }

  center(list, app.screen);
  vertical(sprites, 5);

  center(create, app.screen);
  above(list, create, 10);

  app.stage.addChild(create);
  app.stage.addChild(list);
}