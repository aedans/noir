import * as toolkitRaw from "@reduxjs/toolkit";
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

import defaultDecks from "./decks.json" assert { type: "json" };
import { PayloadAction } from "@reduxjs/toolkit";

export type Deck = {
  cards: { [name: string]: number };
};

export type DecksState = { [name: string]: Deck };

export type AddCardParams = {
  deck: string;
  name: string;
};

export type RemoveCardParams = {
  deck: string;
  name: string;
};

export const decksSlice = createSlice({
  name: "decks",
  initialState: JSON.parse(localStorage.getItem("decks") ?? JSON.stringify(defaultDecks)) as DecksState,
  reducers: {
    addDeckCard: (state, { payload: { name, deck } }: PayloadAction<AddCardParams>) => {
      if (name in state[deck].cards) {
        state[deck].cards[name]++;
      } else {
        state[deck].cards[name] = 1;
      }
    },
    removeDeckCard: (state, { payload: { name, deck } }: PayloadAction<RemoveCardParams>) => {
      if (name in state[deck].cards) {
        state[deck].cards[name]--;

        if (state[deck].cards[name] == 0) {
          delete state[deck].cards[name];
        }
      }
    },
  },
});

export const { addDeckCard, removeDeckCard } = decksSlice.actions;
