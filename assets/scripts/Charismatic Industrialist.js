// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: steal an agent from your opponent, putting it onto your board revealed.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 180 }),
	rank: () => 3,
	useCost: () => ({ money: 0 }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const stealTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => c.revealed == true);
		return util.chooseTargets(stealTargets.map(c => c.id), 1, false, (steal) => {
			if (steal == null) return cc(null);
			return cc({ targets: { steal } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		const card = util.getCardState(choice.targets.steal[0], player, opponent);
		util.destroy(card.id, player, opponent);
		player.board.push({ ...card, revealed: true });
	}
}