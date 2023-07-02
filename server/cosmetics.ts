import moize from "moize";
import { userCollection } from "./db.js";
import { CardCosmetic } from "../common/card.js";

export const getTop = moize.promise(async (card: string): Promise<{ id: string; number: number }> => {
  const users = await userCollection();
  const [max] = await users
    .find()
    .sort({ [`experience.${card}`]: -1 })
    .limit(1)
    .toArray();
  return { id: max._id, number: max.experience[card] };
});

export const getCosmetic = moize.promise(async (id: string | null, name: string): Promise<CardCosmetic> => {
  if (id == null) {
    return { level: 1 };
  }

  const users = await userCollection();
  // const top = await getTop(name);
  // if (top.id == id) {
  //   return { level: "top" };
  // }

  const user = await users.findOne({ _id: id });
  const exp = user?.experience[name] ?? 0;
  const level = exp < 10 ? 0 : exp < 50 ? 1 : exp < 250 ? 2 : 3;
  return { level };
});
