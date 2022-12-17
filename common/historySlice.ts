import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Target } from "./card";
import { GameAction, gameSlice, GameState, initialGameState } from "./gameSlice";

export type HistoryState = {
  history: GameAction[];
  current: GameState;
};

export const initialHistoryState: HistoryState = {
  history: [],
  current: initialGameState,
};

export type HistoryAction = PayloadAction<HistoryParams>;

export type HistoryParams = SetActionParams | SetHiddenParams;

export type SetActionParams = {
  index: number;
  action: GameAction;
};

export type SetHiddenParams = {
  index: number;
  card: Target;
};

export type RevealHiddenActionParams = {
  action: GameAction;
  index: number;
};

export const historySlice = createSlice({
  name: "history",
  initialState: initialHistoryState,
  reducers: {
    reset: () => initialHistoryState,
    setAction: (state, action: PayloadAction<SetActionParams>) => {
      state.history[action.payload.index] = action.payload.action;
      state.current = state.history.reduce(gameSlice.reducer, initialGameState);
    },
    setHidden: (state, action: PayloadAction<SetHiddenParams>) => {
      state.history[action.payload.index] = { type: "hidden", payload: action.payload };
    },
  },
});

export const { reset, setAction, setHidden } = historySlice.actions;
