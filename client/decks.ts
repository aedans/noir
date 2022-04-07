function setDecks(decks: string[]) {
  localStorage.setItem("decks", JSON.stringify(decks));
}

export function getDecks() {
  if (localStorage.getItem("decks") == null) setDecks([]);
  return JSON.parse(localStorage.getItem("decks")) as string[];
}

export function setDeck(name: string, deck: string[]) {
  if (!getDecks().includes(name)) setDecks([...getDecks(), name]);
  localStorage.setItem(`decks/${name}`, JSON.stringify(deck));
}

export function getDeck(name: string) {
  if (!getDecks().includes(name)) setDeck(name, []);
  return JSON.parse(localStorage.getItem(`decks/${name}`)) as string[];
}