// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Next turn, gain $25.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		player.board.push(card);
	},
	turn: {
		board: (util, card, player, opppnent) => {
			util.destroy(card.id, player, opppnent);
			player.money += 25;
		}
	}
}