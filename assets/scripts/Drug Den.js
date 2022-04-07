exports.card = {
	text: () => "Each turn: destroy a hidden guy in your deck and gain $30. If it's purple, gain $40 instead.",
	type: () => "location",
	colors: () => ["purple"],
	cost: () => ({ money: 75 }),
	turn: {
		board: (util, card, player, opponent) => {
			const guys = player.deck
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "guy")
				.filter(c => !c.revealed);
			const guy = util.sample(guys);
			if (guy) {
				const index = player.deck.findIndex(x => util.isEqual(guy, x));
				if (index >= 0) player.deck.splice(index, 1);
				if (util.getCardInfo(guy, player, opponent).colors(util, guy, player, opponent).includes("purple")) {
					player.money += 40;
				} else {
					player.money += 30;
				}
	
			}
		}
	}
}