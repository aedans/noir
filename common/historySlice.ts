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

export type HistoryAction = PayloadAction<HistoryParams, `history/${keyof typeof historySlice.actions}`>;

export type HistoryParams = SetActionParams | SetHiddenParams | SetUndoneParams;

export type SetActionParams = {
  index: number;
  action: GameAction;
};

export type SetHiddenParams = {
  index: number;
  card: Target;
};

export type SetUndoneParams = {
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
      state.history[action.payload.index] = { type: "game/hidden", payload: { card: action.payload.card } };
      state.current = state.history.reduce(gameSlice.reducer, initialGameState);
    },
    setUndone: (state, action: PayloadAction<SetUndoneParams>) => {
      state.history[action.payload.index] = { type: "game/undone", payload: { action: state.history[action.payload.index] } };
      state.current = state.history.reduce(gameSlice.reducer, initialGameState);
    }
  },
});

export const { reset, setAction, setHidden, setUndone } = historySlice.actions;
