// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: put a Random Citizen into your deck.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 90 }),
	rank: () => 2,
	turn: (util, card, player, opponent) => player.deck.push(util.defaultCardState("Random Citizen"))
}