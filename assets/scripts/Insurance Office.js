exports.card = {
	text: () => "Additional cost: activate a green agent. While hidden: if another card on your board is revealed by your opponent, reveal this and gain money equal to its cost.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 40}),
	rank: () => 1
}