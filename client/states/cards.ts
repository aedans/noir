import { Container, Sprite } from "pixi.js";
import { app } from "..";
import { getCards } from "../card";
import { button } from "../sprites/text";
import { beginState } from "../state";
import { below, center, request, top, vertical } from "../ui";

export async function cardsState() {
  beginState('cards');

  const cards = new Container();

  const list = new Container();

  const upload = button("Upload Card");

  const fileElem = document.createElement("input");
  fileElem.type = "file";
  fileElem.accept = "*";
  fileElem.multiple = true;

  let password: string;
  upload.on('pointerdown', () => {
    password = request("Password", "");
    fileElem.click();
  });

  fileElem.onchange = function () {
    for (const file of fileElem.files) {
      file.text().then(text => {
        fetch(`${window.location.origin}/cards`, {
          headers: { 'Content-Type': 'application/json' },
          method: "POST",
          body: JSON.stringify({ 
            password,
            name: file.name,
            text: text,
          }),
        }).then(x => x.json())
          .then(x => alert(x.message));
      });
    }
  }

  let scroll = 0;
  window.addEventListener('wheel', (e) => {
    scroll -= e.deltaY;
    if (scroll > 0) scroll = 0;
    cards.y = 5 + scroll;
  });

  const sprites: Container[] = [];
  for (const card of await getCards()) {
    const sprite = button(card);

    sprite.on('pointerdown', () => {
      const aElem = document.createElement("a");
      aElem.href = `http://${window.location.hostname}:${window.location.port}/download?asset=/scripts/${card}.js`;
      aElem.download = `${card}.js`;
      aElem.click();
    })

    list.addChild(sprite);
    sprites.push(sprite);
  }

  vertical(sprites, 5);
  below(upload, list, 20);

  cards.addChild(upload);
  cards.addChild(list);

  center(cards, app.screen);
  top(cards, 5);

  app.stage.addChild(cards);
}