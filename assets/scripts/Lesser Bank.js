// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: gain $10",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 50}),
	rank: () => 1,
  turn: {
    board: (util, card, player) => player.money += 10
  }
}