import { CardInfo } from "./card";

export function mapSorted<T, A>(array: A[], map: (a: A) => T, ...compares: ((a: T, b: T) => number)[]) {
  return [...array].sort((a, b) => {
    for (const compare of compares) {
      let res = compare(map(a), map(b));
      if (res != 0) {
        return res;
      }
    }

    return 0;
  });
}

export function compareMoney(a: CardInfo, b: CardInfo) {
  return a.cost.money - b.cost.money;
}

export function compareColor(a: CardInfo, b: CardInfo) {
  return (
    a.colors.map((color) => color.charCodeAt(0)).reduce((a, b) => a + b, 0) -
    b.colors.map((color) => color.charCodeAt(0)).reduce((a, b) => a + b, 0)
  );
}
