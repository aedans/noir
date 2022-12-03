import { createSlice } from "@reduxjs/toolkit";
import defaultDecks from "./decks.json";

export type Deck = {
  cards: string[];
};

export type DecksState = { [name: string]: Deck };

export const decksSlice = createSlice({
  name: "decks",
  initialState: JSON.parse(localStorage.getItem("decks") ?? JSON.stringify(defaultDecks)) as DecksState,
  reducers: {},
});
