// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever an agent is played, its controller reveals a card from their deck.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 35 }),
	rank: () => 1,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			play: (util, card, player, opponent) => {
				const play = info.play(util, card, player, opponent);
				if (play == null) return null;
				return (choice) => {
					play(choice);
					util.revealRandom(player.deck, player, opponent);
				}
			}
		})
	}
}