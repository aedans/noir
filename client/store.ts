import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import gameReducer from "./game/gameSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export type NoirState = ReturnType<typeof store.getState>;
export type NoirDispatch = typeof store.dispatch;

export const useNoirDispatch: () => NoirDispatch = useDispatch;
export const useNoirSelector: TypedUseSelectorHook<NoirState> = useSelector;
