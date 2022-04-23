// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and another purple agent: steal a card from your opponent's deck, putting it hidden into your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { purple: 1 } }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const stealTargets = util.filter(opponent.deck, "revealed", player, opponent);
		return util.chooseTargets(stealTargets.map(c => c.id), 1, false, (steal) => {
			if (steal == null) return cc(null);
			return cc({ targets: { steal } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const card = util.getCardState(choice.targets.steal[0], player, opponent);
		util.destroy(card.id, player, opponent);
		player.board.push({ ...card, revealed: true });
	}
}