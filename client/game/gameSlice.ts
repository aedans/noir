import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardState } from "../../common/card";

export type GameState = {
  hand: CardState[];
  board: CardState[];
};

const initialState: GameState = {
  hand: [
    {
      id: "a",
      name: "A",
    },
    {
      id: "b",
      name: "B",
    },
    {
      id: "c",
      name: "C"
    }
  ],
  board: [],
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    playCard: (state, action: PayloadAction<string>) => {
      const card = state.hand.find((c) => c.id == action.payload);

      if (card) {
        state.hand = state.hand.filter((c) => c.id != card.id);
        state.board.push(card);
      }
    },
  },
});

export const { playCard } = gameSlice.actions;

export default gameSlice.reducer;
