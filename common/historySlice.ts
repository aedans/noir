import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import produce from "immer";
import { Target } from "./card";
import { GameAction, gameReducers, GameState, initialGameState } from "./gameSlice";

export type HistoryState = {
  history: GameAction[];
  current: GameState;
};

export function initialHistoryState(): HistoryState {
  return {
    history: [],
    current: initialGameState(),
  };
}

export type HistoryAction = PayloadAction<HistoryParams, `history/${keyof typeof historySlice.actions}`>;

export type HistoryParams = SetActionParams | SetHiddenParams | SetUndoneParams;

export type SetActionParams = {
  index: number;
  action: GameAction;
};

export type SetHiddenParams = {
  index: number;
  target: Target;
};

export type SetUndoneParams = {
  index: number;
};

export function cleanAction(action: HistoryAction) {
  return produce(action, (action) => {
    if (action.type == "history/setHidden") {
      const payload = action.payload as SetHiddenParams;
      payload.target = { id: payload.target.id };
    }

    if (action.type == "history/setAction") {
      const payload = action.payload as SetActionParams;

      if (payload.action.payload.source) {
        payload.action.payload.source = { id: payload.action.payload.source.id };
      }

      if (payload.action.payload.target) {
        payload.action.payload.target = { id: payload.action.payload.target.id };
      }
    }
  });
}

export function liftAction(index: number, action: GameAction | HistoryAction): HistoryAction {
  if (action.type.startsWith("history")) {
    return action as HistoryAction;
  } else {
    return setAction({
      index,
      action: action as GameAction,
    });
  }
}

function reduce(history: GameAction[], state: GameState) {
  for (const action of history) {
    if (action) {
      const name = action.type.replace("game/", "") as keyof typeof gameReducers;
      (gameReducers[name] as (state: GameState, action: GameAction) => void)(state, action);
    }
  }

  return state;
}

export const historySlice = createSlice({
  name: "history",
  initialState: initialHistoryState(),
  reducers: {
    reset: () => initialHistoryState(),
    setAction: (state, action: PayloadAction<SetActionParams>) => {
      state.history[action.payload.index] = action.payload.action;
      state.current = reduce(state.history, initialGameState());
    },
    setHidden: (state, action: PayloadAction<SetHiddenParams>) => {
      state.history[action.payload.index] = {
        type: "game/hidden",
        payload: { target: action.payload.target },
      };
      state.current = reduce(state.history, initialGameState());
    },
    setUndone: (state, action: PayloadAction<SetUndoneParams>) => {
      state.history[action.payload.index] = {
        type: "game/undone",
        payload: { action: state.history[action.payload.index] },
      };
      state.current = reduce(state.history, initialGameState());
    },
  },
});

export const { reset, setAction, setHidden, setUndone } = historySlice.actions;
