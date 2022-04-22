// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Up to three of your opponent's agents cannot be activated next turn.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const accostTargets = util.filter(opponent.board, "revealed agent", player, opponent);
		return util.chooseTargets(accostTargets.map(c => c.id), 3, true, (accost) => {
			if (accost == null) return cc(null);
			return cc({ targets: { accost } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		card.strings.accost = choice.targets.accost;
		player.board.push(card);
	},
	turn: (util, card, player, opponent) => util.destroy(card.id, player, opponent),
	effects: {
		board: (util, state, player, opponent) => (info) => ({
			...info,
			update: (util, card, player, opponent) => {
				if (state.strings.accost.includes(card.id)) {
					card.activated = true;
				}
			}
		})
	}
}