import { Container, Sprite } from "pixi.js";
import { app } from "..";
import { getCards } from "../card";
import { button } from "../sprites/text";
import { beginState } from "../state";
import { below, center, scrollContainer, top, vertical } from "../ui";

export async function cardsState() {
  beginState('cards');

  const scroll = scrollContainer();

  const list = new Container();

  const upload = button("Upload Card");

  const fileElem = document.createElement("input");
  fileElem.type = "file";
  fileElem.accept = "*";
  fileElem.multiple = true;

  let password: string;
  upload.on('pointerdown', () => {
    password = window.prompt("Password");
    fileElem.click();
  });

  fileElem.onchange = function () {
    for (const file of fileElem.files) {
      file.text().then(text => {
        fetch(`http://${window.location.hostname}:${window.location.port}/cards`, {
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

  const sprites: Sprite[] = [];
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
  below(upload, list, 10);

  scroll.addChild(upload);
  scroll.addChild(list);

  center(scroll, app.screen);
  top(scroll, 5);

  app.stage.addChild(scroll);
}