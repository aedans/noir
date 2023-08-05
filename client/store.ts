import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { historySlice } from "../common/historySlice";
import { decksSlice } from "./decksSlice";

export const store = configureStore({
  reducer: {
    game: historySlice.reducer,
    decks: decksSlice.reducer,
  },
});

export type ClientState = ReturnType<typeof store.getState>;
export type ClientDispatch = typeof store.dispatch;

export const useClientDispatch: () => ClientDispatch = useDispatch;
export const useClientSelector: TypedUseSelectorHook<ClientState> = useSelector;

export function updateLocalStorage() {
  if (localStorage.getItem("v") != "4") {
    localStorage.clear();
  }

  localStorage.setItem("v", "4");
}

export function getUsername(): string {
  const user = localStorage.getItem("user");
  if (user != null) {
    return user;
  } else {
    while (true) {
      const name = window.prompt("Username");
      if (name != null && name != "") {
        localStorage.setItem("user", name);
        return name;
      }
    }
  }
}

store.subscribe(() => {
  localStorage.setItem("decks", JSON.stringify(store.getState().decks));
});
