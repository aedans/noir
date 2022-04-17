export function arrayEquals(a: any[], b: any[]) {
  return a.length == b.length && a.every((val, index) => val == b[index]);
}

export function sample<T>(ts: T[]) {
  return ts[Math.floor(Math.random() * ts.length)];
}