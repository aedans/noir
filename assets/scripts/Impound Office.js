// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and a blue agent: destroy one of your opponent's operations. Gain $10.",
	type: () => "location",
	colors: () => ["blue"],
	cost: () => ({ money: 40 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { blue: 1 } }), 
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "operation")
			.filter(c => c.revealed == true);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
		player.money += 10;
	}
}