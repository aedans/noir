// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Steal an agent and put it revealed onto your board.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 80, agents: { green: 1 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const stealTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(stealTargets.map(c => c.id), 1, false, (steal) => {
			if (steal == null) return cc(null);
			return cc({ targets: { steal } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const card = util.getCardState(choice.targets.steal[0], player, opponent);
		util.remove(card.id, player, opponent);
		player.board.push({ ...card, revealed: true });
	}
}