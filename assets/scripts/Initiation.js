// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate any number of agents. Next turn, they become purple.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = util.filter(player.board, "agent", player, opponent);
		return util.chooseTargets(activateTargets.map(c => c.id), Infinity, true, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		card.strings.activate = choice.targets.activate;
		player.board.push(card);
	},
	turn: (util, card, player, opponent) => {
		for (const id of card.strings.activate) {
			const state = util.getCardState(id, player, opponent);
			state.modifiers.push({ name: "purple", card: card.id });
		}

		util.destroy(card.id, player, opponent);
	},
	modifiers: {
		purple: (info) => ({
			...info,
			colors: (util, card, player, opponent) => ["purple"]
		})
	}
}