import { AnyAction } from "redux";
import { CardState, PartialCardInfoComputation } from "../common/card";
import CardInfoCache from "../common/CardInfoCache";
import { createTRPCProxyClient, httpBatchLink, httpLink, splitLink } from "@trpc/client";
import { NoirRouter } from "../common/network";
import superjson from "superjson";

export const serverOrigin = window.location.origin.toString().replace(/5173/g, "8080");
export const auth: { token: string | null } = { token: null };

export const trpc = createTRPCProxyClient<NoirRouter>({
  transformer: superjson,
  links: [
    splitLink({
      condition(op) {
        return auth.token != null || !["auth", "user", "top"].includes(op.path);
      },
      true: httpBatchLink({
        url: `${serverOrigin}/trpc`,
      }),
      false: httpLink({
        url: `${serverOrigin}/trpc`,
      }),
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
    const cardString = await fetch(`${serverOrigin}/cards/${card.name}.js`).then((x) => x.text());
    const cardInfo = (await import(/* @vite-ignore */ `data:text/javascript,${cardString}`)) as {
      card: PartialCardInfoComputation;
    };
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

  if (action.type == "game/revealCard" && action.payload.target?.name) {
    await loadCard({ name: action.payload.target.name });
  }
}
