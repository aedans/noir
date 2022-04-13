// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additonal cost: activate an orange agent. Whenever an agent on your board is revealed, reveal a hidden card on your opponent's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 70 }),
	rank: () => 3,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
	},
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			reveal: (util, card, player, opponent) => {
				if (player.board.find(c => c.id == card.id)) {
					util.revealRandom(opponent.board, player, opponent);
				}
			}
		})
	}
}