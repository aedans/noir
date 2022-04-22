// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
  text: () => "Each turn: gain $20.",
  type: () => "location",
  colors: () => [],
  cost: () => ({ money: 100 }),
  rank: () => 2,
  turn: (util, card, player) => player.money += 20
}
