exports.card = {
	text: () => "Activate and destroy this: gain $60.",
	type: () => "guy",
	colors: () => ["green"],
	cost: () => ({ money: 40 }),
	useCost: () => ({ money: 0 }),
	use: (util, card, player) => () => {
		card.revealed = true;
		card.used = true;
		const index = player.board.findIndex(x => util.isEqual(card, x));
		if (index) player.board.splice(index, 1);
		player.money += 60;
	}
}