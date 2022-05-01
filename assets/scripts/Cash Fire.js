// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents. Set each player's money equal to $0.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0, agents: { orange: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		player.money = 0;
		opponent.money = 0;
	}
}