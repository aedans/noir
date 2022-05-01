// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever a player plays an operation, they get $5.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 55 }),
	rank: () => 2,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			play: (util, card, player, opponent) => {
				const play = (info.play ?? (() => () => {}))(util, card, player, opponent);
				if (play == null) return null;
				return (choice) => {
					if (info.type(util, card, player, opponent) == "operation") {
						player.money += 5;						
					}
					play(choice);
				}
			}
		})
	}
}