// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an agent, reveal a hidden green card in your deck: gain $60.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 150 }),
	rank: () => 3,
	useChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	use: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => !c.revealed);
		if (cards.length == 0) return null;
		return (choice) => {
			util.reveal(cards);
			util.activate(choice.targets.activate[0], player, opponent);
			player.money += 60;
		}
	}
}