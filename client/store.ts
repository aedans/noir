import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { historySlice } from "../common/historySlice";
import { decksSlice } from "../common/decksSlice";
import { enableBatching } from "redux-batched-actions";

export const store = configureStore({
  reducer: {
    game: enableBatching(historySlice.reducer),
    decks: decksSlice.reducer,
  },
});

export type ClientState = ReturnType<typeof store.getState>;
export type ClientDispatch = typeof store.dispatch;

export const useClientDispatch: () => ClientDispatch = useDispatch;
export const useClientSelector: TypedUseSelectorHook<ClientState> = useSelector;

export function updateLocalStorage() {
  if (localStorage.getItem("v") == null) {
    localStorage.clear();
  }

  localStorage.setItem("v", "1");
}

store.subscribe(() => {
  localStorage.setItem("decks", JSON.stringify(store.getState().decks));
});
