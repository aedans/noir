import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { gameSlice } from "../common/gameSlice";
import { decksSlice } from "../common/decksSlice";

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
    decks: decksSlice.reducer,
  },
});

export type ClientState = ReturnType<typeof store.getState>;
export type ClientDispatch = typeof store.dispatch;

export const useClientDispatch: () => ClientDispatch = useDispatch;
export const useClientSelector: TypedUseSelectorHook<ClientState> = useSelector;

store.subscribe(() => {
  localStorage.setItem("decks", JSON.stringify(store.getState().decks));
});
