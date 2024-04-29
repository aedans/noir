import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { decksSlice } from "./decksSlice";
import { gameSlice } from "../common/gameSlice";

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

export function updateLocalStorage() {
  if (localStorage.getItem("v") != "6") {
    localStorage.clear();
  }

  localStorage.setItem("v", "6");
}

export async function getUsername(): Promise<string> {
  const user = localStorage.getItem("user");
  if (user != null) {
    return user;
  } else {
    const generator = import("unique-username-generator");
    const name = (await generator).generateUsername("-");
    localStorage.setItem("user", name);
    return name;
  }
}

store.subscribe(() => {
  localStorage.setItem("decks", JSON.stringify(store.getState().decks));
});
