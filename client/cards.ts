import { AnyAction } from "redux";
import { CardState, PartialCardInfoComputation } from "../common/card";
import CardInfoCache from "../common/CardInfoCache";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { NoirRouter } from "../common/network";
import superjson from "superjson";

export const serverOrigin = window.location.origin.toString().replace(/5173/g, "8080");

export const trpc = createTRPCProxyClient<NoirRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${serverOrigin}/trpc`,
    }),
  ],
});

const cards: { [name: string]: PartialCardInfoComputation } = {};

export default class RemoteCardInfoCache extends CardInfoCache {
  getPartialCardInfoComputation(card: CardState): PartialCardInfoComputation {
    try {
      if (!(card.name in cards)) {
        throw new Error(`Card ${card.name} is not loaded`);
      }

      return cards[card.name];
    } catch (e) {
      console.error(`Error getting card info for ${card.name}`);
      throw e;
    }
  }
}

async function getPartialCardInfoComputation(card: { name: string }) {
  try {
    const cardString = await fetch(`${serverOrigin}/cards/${card.name}.cjs`).then((x) => x.text());
    const cardInfo = {} as { card: PartialCardInfoComputation };
    new Function("exports", cardString)(cardInfo);
    return cardInfo.card;
  } catch (e) {
    console.error(`Error loading card ${card.name}`);
    throw e;
  }
}

export function isLoaded(card: { name: string }) {
  return card.name in cards;
}

export async function loadCard(card: { name: string }) {
  if (!isLoaded(card)) {
    cards[card.name] = await getPartialCardInfoComputation(card);
  }
}

export async function loadCardsFromAction(action: AnyAction) {
  if (action.type == "game/addCard") {
    await loadCard({ name: action.payload.name });
  }

  if (action.type == "history/setAction") {
    await loadCardsFromAction(action.payload.action);
  }
}
