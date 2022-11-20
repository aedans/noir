export type Deck = {
  name: string,
  icon: string,
  cards: string[],
}

const starterDecks: { [name: string]: Deck } = {
  "Blue": {
    name: "Blue",
    icon: "",
    cards: []
  },
  "Orange": {
    name: "Orange",
    icon: "Cash Fire",
    cards: []
  },
  "Green": {
    name: "Green",
    icon: "",
    cards: []
  },
  "Purple": {
    name: "Purple",
    icon: "Purloin",
    cards: []
  },
}

function emptyDeck(name: string) {
  return {
    name,
    icon: "",
    x: 0,
    y: 0,
    z: 0,
    cards: [],  
  };
}

function setDeckNames(decks: string[]) {
  localStorage.setItem("decks", JSON.stringify(decks));
}

export function getDeckNames() {
  if (localStorage.getItem("decks") == null) setDeckNames(Object.keys(starterDecks));
  return JSON.parse(localStorage.getItem("decks")!) as string[];
}

export function updateDeck(deck: Deck) {
  if (!getDeckNames().includes(deck.name)) setDeckNames([...getDeckNames(), deck.name]);
  localStorage.setItem(`decks/${deck.name}`, JSON.stringify(deck));
}

export function getDeck(name: string) {
  if (!getDeckNames().includes(name)) updateDeck(emptyDeck(name));
  if (localStorage.getItem(`decks/${name}`) == null) updateDeck(starterDecks[name] ?? emptyDeck(name));
  return JSON.parse(localStorage.getItem(`decks/${name}`)!) as Deck;
}