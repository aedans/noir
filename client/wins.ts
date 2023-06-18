export function setWon(name: string) {
  const wins = JSON.parse(localStorage.getItem("wins") ?? "[]") as string[];
  if (wins.find((id) => id == name) == null) {
    localStorage.setItem("wins", JSON.stringify([...wins, name]));
  }
}

export function hasWon(name: string) {
  return (JSON.parse(localStorage.getItem("wins") ?? "[]") as string[]).find((id) => id == name) != null;
}
